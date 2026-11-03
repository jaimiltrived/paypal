import pytest
from app.utils.money import cents_to_paypal_string, paypal_string_to_cents


def test_cents_to_paypal_string():
    assert cents_to_paypal_string(1050) == "10.50"
    assert cents_to_paypal_string(0) == "0.00"
    assert cents_to_paypal_string(99) == "0.99"
    assert cents_to_paypal_string(100000) == "1000.00"

    with pytest.raises(ValueError, match="cannot be negative"):
        cents_to_paypal_string(-50)


def test_paypal_string_to_cents():
    assert paypal_string_to_cents("10.50") == 1050
    assert paypal_string_to_cents("0.00") == 0
    assert paypal_string_to_cents("0.99") == 99
    assert paypal_string_to_cents("1000.00") == 100000
    assert paypal_string_to_cents("15") == 1500

    with pytest.raises(ValueError):
        paypal_string_to_cents("-10.50")

    with pytest.raises(ValueError):
        paypal_string_to_cents("invalid_number")

