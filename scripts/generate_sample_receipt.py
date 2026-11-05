import os
import shutil
from PIL import Image, ImageDraw, ImageFont

def create_receipt_image(
    filename: str,
    vendor_name: str,
    vendor_address: str,
    receipt_title: str,
    invoice_number: str,
    date_str: str,
    items: list[tuple[str, int, float, float]],  # name, qty, unit_price, total
    subtotal: float,
    tax: float,
    total: float,
    currency_symbol: str = "$",
    notes: str = "Thank you for your business!",
):
    # Image dimensions
    width = 650
    # Estimate height based on items
    height = 580 + (len(items) * 36)

    # Clean off-white paper texture background
    img = Image.new("RGB", (width, height), color=(253, 253, 252))
    draw = ImageDraw.Draw(img)

    # Draw border / paper drop-shadow effect
    draw.rectangle([(8, 8), (width - 9, height - 9)], outline=(218, 222, 229), width=2)
    draw.rectangle([(12, 12), (width - 13, height - 13)], outline=(235, 238, 242), width=1)

    # Use standard system font fallback or default
    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_subtitle = ImageFont.truetype("arial.ttf", 15)
        font_bold = ImageFont.truetype("arialbd.ttf", 16)
        font_main = ImageFont.truetype("arial.ttf", 15)
        font_total = ImageFont.truetype("arialbd.ttf", 22)
        font_mono = ImageFont.truetype("consola.ttf", 15)
        font_small = ImageFont.truetype("arial.ttf", 13)
    except Exception:
        font_title = ImageFont.load_default()
        font_subtitle = font_title
        font_bold = font_title
        font_main = font_title
        font_total = font_title
        font_mono = font_title
        font_small = font_title

    # Header
    y = 35
    draw.text((width // 2, y), vendor_name, fill=(18, 24, 38), font=font_title, anchor="mm")
    y += 28
    draw.text((width // 2, y), vendor_address, fill=(100, 110, 125), font=font_subtitle, anchor="mm")
    y += 24
    draw.text((width // 2, y), f"TEL: (800) 555-0199  •  VAT / TAX ID: US-8492019", fill=(120, 130, 145), font=font_small, anchor="mm")
    y += 20

    # Separator
    draw.line([(35, y), (width - 35, y)], fill=(200, 205, 215), width=2)
    y += 18

    # Meta Info
    draw.text((35, y), f"RECEIPT / INVOICE: {invoice_number}", fill=(30, 41, 59), font=font_bold)
    draw.text((width - 35, y), f"DATE: {date_str}", fill=(71, 85, 105), font=font_main, anchor="ra")
    y += 25
    draw.text((35, y), f"TRANSACTION TYPE: Sale (Electronic Checkout)", fill=(100, 116, 139), font=font_small)
    draw.text((width - 35, y), f"PAYMENT: PayPal Verified", fill=(2, 132, 199), font=font_bold, anchor="ra")
    y += 25

    # Table Header
    draw.rectangle([(35, y), (width - 35, y + 32)], fill=(241, 245, 249))
    draw.text((45, y + 8), "ITEM DESCRIPTION", fill=(51, 65, 85), font=font_bold)
    draw.text((360, y + 8), "QTY", fill=(51, 65, 85), font=font_bold, anchor="mm")
    draw.text((460, y + 8), "UNIT", fill=(51, 65, 85), font=font_bold, anchor="mm")
    draw.text((width - 45, y + 8), "TOTAL", fill=(51, 65, 85), font=font_bold, anchor="ra")
    y += 40

    # Line Items
    for name, qty, unit_price, line_total in items:
        draw.text((45, y), name, fill=(30, 41, 59), font=font_main)
        draw.text((360, y), str(qty), fill=(51, 65, 85), font=font_mono, anchor="mm")
        draw.text((460, y), f"{currency_symbol}{unit_price:.2f}", fill=(51, 65, 85), font=font_mono, anchor="mm")
        draw.text((width - 45, y), f"{currency_symbol}{line_total:.2f}", fill=(15, 23, 42), font=font_bold, anchor="ra")
        y += 32
        draw.line([(35, y - 6), (width - 35, y - 6)], fill=(243, 244, 246), width=1)

    y += 10
    draw.line([(35, y), (width - 35, y)], fill=(203, 213, 225), width=2)
    y += 15

    # Summary Totals Box
    summary_x = width - 260
    draw.text((summary_x, y), "Subtotal:", fill=(71, 85, 105), font=font_main)
    draw.text((width - 45, y), f"{currency_symbol}{subtotal:.2f}", fill=(51, 65, 85), font=font_mono, anchor="ra")
    y += 28

    draw.text((summary_x, y), "Sales Tax (8.5%):", fill=(71, 85, 105), font=font_main)
    draw.text((width - 45, y), f"{currency_symbol}{tax:.2f}", fill=(51, 65, 85), font=font_mono, anchor="ra")
    y += 32

    # Grand Total Highlight Banner
    draw.rectangle([(summary_x - 10, y - 4), (width - 35, y + 36)], fill=(238, 242, 255), outline=(199, 210, 254), width=1)
    draw.text((summary_x, y + 4), "GRAND TOTAL:", fill=(30, 58, 138), font=font_total)
    draw.text((width - 45, y + 4), f"{currency_symbol}{total:.2f}", fill=(30, 58, 138), font=font_total, anchor="ra")
    y += 55

    # Bottom Notes & Barcode representation
    draw.line([(35, y), (width - 35, y)], fill=(226, 232, 240), width=1)
    y += 15
    draw.text((width // 2, y), notes, fill=(100, 116, 139), font=font_subtitle, anchor="mm")
    y += 24
    draw.text((width // 2, y), f"* {invoice_number} *", fill=(148, 163, 184), font=font_mono, anchor="mm")

    # Barcode simulated lines
    y += 16
    barcode_start = width // 2 - 120
    import random
    random.seed(42)
    cur_x = barcode_start
    while cur_x < width // 2 + 120:
        bar_w = random.choice([2, 3, 4, 1])
        draw.line([(cur_x, y), (cur_x, y + 28)], fill=(30, 41, 59), width=bar_w)
        cur_x += bar_w + random.choice([2, 3, 4])

    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    img.save(filename, "PNG", quality=95)
    print(f"Generated receipt: {filename}")


if __name__ == "__main__":
    out_dir = "sample_receipts"
    os.makedirs(out_dir, exist_ok=True)

    # 1. Hardware & Tech Invoice
    create_receipt_image(
        filename=os.path.join(out_dir, "receipt_tech_store.png"),
        vendor_name="Apex Cloud & Hardware Depot",
        vendor_address="742 Evergreen Terrace, Suite 400, San Jose, CA 95112",
        receipt_title="CUSTOMER SALES RECEIPT",
        invoice_number="INV-2026-8841",
        date_str="2026-11-04",
        items=[
            ("Pro Ergonomic Mechanical Keyboard", 1, 149.00, 149.00),
            ("Thunderbolt 4 High-Speed USB-C Dock", 1, 85.00, 85.00),
            ("Braided Ultra-HD DisplayPort Cable", 2, 12.50, 25.00),
        ],
        subtotal=259.00,
        tax=22.02,
        total=281.02,
        notes="Return Policy: 30 days return with original receipt and packaging.",
    )

    # 2. Coffee & Bakery Bistro
    create_receipt_image(
        filename=os.path.join(out_dir, "receipt_bistro_cafe.png"),
        vendor_name="Artisan Roast Bistro & Bakery",
        vendor_address="108 Market Street, San Francisco, CA 94105",
        receipt_title="DINING RECEIPT",
        invoice_number="RCPT-59201",
        date_str="2026-11-05",
        items=[
            ("Vanilla Oat Latte (Large)", 2, 6.50, 13.00),
            ("Avocado Sourdough Toast w/ Poached Egg", 1, 14.50, 14.50),
            ("Blueberry Meyer Lemon Tart", 1, 7.00, 7.00),
        ],
        subtotal=34.50,
        tax=2.93,
        total=37.43,
        notes="Table 14 - Thank you for dining with Artisan Roast!",
    )

    # 3. Cloud SaaS & Hosting Invoice
    create_receipt_image(
        filename=os.path.join(out_dir, "receipt_cloud_services.png"),
        vendor_name="NovaScale Cloud Infrastructure Inc.",
        vendor_address="100 Enterprise Way, Austin, TX 78701",
        receipt_title="SUBSCRIPTION BILLING INVOICE",
        invoice_number="NOV-90412",
        date_str="2026-11-01",
        items=[
            ("High-Performance GPU Worker Nodes (H100)", 2, 75.00, 150.00),
            ("Managed Vector Database Cluster (Small)", 1, 45.00, 45.00),
            ("Bandwidth Egress Allocation (1TB Tier)", 1, 15.00, 15.00),
        ],
        subtotal=210.00,
        tax=17.85,
        total=227.85,
        notes="Net 30. Direct Debit via PayPal Pre-Approved Billing.",
    )

    print("All sample receipt images generated successfully.")

