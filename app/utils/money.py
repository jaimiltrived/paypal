from decimal import Decimal, ROUND_HALF_UP


def cents_to_paypal_string(amount_cents: int) -> str:
    """Convert integer cents into a PayPal formatted decimal string (e.g., 1050 -> '10.50')."""
    if amount_cents < 0:
        raise ValueError("Amount in cents cannot be negative.")
    decimal_val = (Decimal(amount_cents) / Decimal(100)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return str(decimal_val)


def paypal_string_to_cents(amount_str: str) -> int:
    """Convert a decimal string (e.g. '10.50') into integer cents (1050)."""
    try:
        decimal_val = Decimal(amount_str)
        if decimal_val < 0:
            raise ValueError("Amount cannot be negative.")
        cents = int((decimal_val * Decimal(100)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        return cents
    except Exception as exc:
        raise ValueError(f"Invalid monetary string '{amount_str}': {exc}") from exc

