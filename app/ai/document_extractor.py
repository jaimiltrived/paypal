import json
import re
from typing import Any, Dict, Optional
from app.ai.ollama_client import OllamaClient, get_ollama_client
from app.core.exceptions import PayOpsException
from app.core.logging import logger
from app.schemas.ai import DocumentExtractionResult, ExtractedLineItem
from app.utils.money import paypal_string_to_cents

EXTRACTION_SYSTEM_PROMPT = """You are an expert AI financial document analyst for PayOps AI.
Your task is to analyze bills, receipts, and invoices, and extract structured financial data in raw JSON format.

Output MUST be a valid JSON object matching this schema:
{
  "vendor_name": "string or null",
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "currency": "USD",
  "line_items": [
    {
      "name": "item description",
      "quantity": 1,
      "unit_price": "10.00",
      "line_total": "10.00"
    }
  ],
  "subtotal": "10.00",
  "tax_amount": "0.00",
  "total_amount": "10.00",
  "notes": "optional notes or terms"
}

Rules:
1. Return ONLY the raw JSON object. Do not include introductory or concluding prose.
2. Format all prices as decimal strings with 2 decimal places (e.g. '15.50').
3. Default currency to 'USD' if not explicitly stated.
4. Ensure arithmetic accuracy across line items.
"""


class DocumentExtractor:
    """Specialized service for extracting structured invoice/bill data using Qwen2.5-VL and Llama."""

    def __init__(self, client: Optional[OllamaClient] = None):
        self.client = client or get_ollama_client()

    def _clean_json_response(self, raw_text: str) -> Dict[str, Any]:
        """Strip markdown fences and parse JSON payload."""
        cleaned = raw_text.strip()
        # Remove markdown code blocks if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        # Find first { and last }
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx : end_idx + 1]

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error(f"Failed to parse model JSON: {cleaned}")
            raise PayOpsException(
                message=f"AI model did not return valid JSON: {exc}",
                status_code=502,
                details={"raw_output": raw_text[:500]},
            ) from exc

    async def extract_from_image_or_text(
        self,
        image_base64: Optional[str] = None,
        document_text: Optional[str] = None,
    ) -> DocumentExtractionResult:
        """Extract structured bill/invoice data from image base64 or document text."""
        if not image_base64 and not document_text:
            raise PayOpsException("Must provide either image_base64 or document_text for extraction.")

        images = [image_base64] if image_base64 else None
        prompt = "Analyze this financial invoice or receipt document and extract all fields in JSON format."
        if document_text:
            prompt += f"\n\nDocument Text:\n{document_text}"

        # Choose model: Qwen2.5-VL 3B for image/vision; Llama 3.2 1B for pure text
        model = self.client.vision_model if images else self.client.text_model

        raw_response = await self.client.generate(
            prompt=prompt,
            model=model,
            images=images,
            system_prompt=EXTRACTION_SYSTEM_PROMPT,
            temperature=0.0,
        )

        data = self._clean_json_response(raw_response)

        # Parse and convert to strict integer cents
        line_items: list[ExtractedLineItem] = []
        computed_subtotal_cents = 0

        for item in data.get("line_items", []):
            try:
                name = str(item.get("name", "Item")).strip() or "Item"
                qty = int(item.get("quantity", 1))
                if qty <= 0:
                    qty = 1

                unit_price_cents = paypal_string_to_cents(str(item.get("unit_price", "0.00")))
                line_total_cents = paypal_string_to_cents(str(item.get("line_total", "0.00")))
                if line_total_cents == 0 and unit_price_cents > 0:
                    line_total_cents = unit_price_cents * qty

                computed_subtotal_cents += line_total_cents

                line_items.append(
                    ExtractedLineItem(
                        name=name,
                        quantity=qty,
                        unit_price_cents=unit_price_cents,
                        line_total_cents=line_total_cents,
                    )
                )
            except Exception as e:
                logger.warning(f"Error parsing line item: {item} - {e}")

        # Parse amounts in cents
        try:
            subtotal_cents = paypal_string_to_cents(str(data.get("subtotal", "0.00")))
        except Exception:
            subtotal_cents = computed_subtotal_cents

        if subtotal_cents == 0 and computed_subtotal_cents > 0:
            subtotal_cents = computed_subtotal_cents

        try:
            tax_cents = paypal_string_to_cents(str(data.get("tax_amount", "0.00")))
        except Exception:
            tax_cents = 0

        try:
            total_cents = paypal_string_to_cents(str(data.get("total_amount", "0.00")))
        except Exception:
            total_cents = subtotal_cents + tax_cents

        # Arithmetic validation
        is_arithmetic_valid = (subtotal_cents + tax_cents) == total_cents

        return DocumentExtractionResult(
            vendor_name=data.get("vendor_name"),
            invoice_number=data.get("invoice_number"),
            invoice_date=data.get("invoice_date"),
            due_date=data.get("due_date"),
            currency=str(data.get("currency", "USD")).upper(),
            line_items=line_items,
            subtotal_cents=subtotal_cents,
            tax_amount_cents=tax_cents,
            total_amount_cents=total_cents,
            is_arithmetic_valid=is_arithmetic_valid,
            confidence_score=0.92 if is_arithmetic_valid else 0.70,
            notes=data.get("notes"),
        )

