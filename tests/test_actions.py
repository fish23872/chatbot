import pytest
from actions.utils.phone_normalizer import PhoneNormalizer

@pytest.mark.parametrize("input_model, expected_output", [
    ("s23", "Samsung Galaxy S23"),
    ("galaxy s23", "Samsung Galaxy S23"),
    ("samsung s23", "Samsung Galaxy S23"),
    ("Samsung Galaxy S23 Ultra", "Samsung Galaxy S23 Ultra"),
    ("S20 FE", "Samsung Galaxy S20 Fe"),
    ("z fold5", "Samsung Galaxy Z Fold5"),
    ("galaxy a54 5g", "Samsung Galaxy A54 5G"),
    ("s21+", "Samsung Galaxy S21 +"),
    ("note 20 ultra", "Samsung Galaxy Note 20 Ultra"),
    ("mi 11", "Xiaomi Mi 11"),
    ("redmi note 10", "Xiaomi Redmi Note 10"),
    ("xiaomi 12t pro", "Xiaomi 12T Pro"),
    ("poco x5", "Xiaomi Poco X5"),
    ("redmi 9a", "Xiaomi Redmi 9A"),
    ("iPhone 13 Pro Max", "iPhone 13 Pro Max"),
    ("iphone 14 pro", "iPhone 14 Pro"),
    ("iphone se", "iPhone SE"),
    ("iphone 12 mini", "iPhone 12 Mini"),
    ("oneplus 11", "OnePlus 11"),
    ("op9 pro", "OnePlus 9 Pro"),
    ("one plus nord 3", "OnePlus Nord 3"),
    ("oneplus 10t", "OnePlus 10T"),
    ("random model", None),
    ("", None),
    ("galaxy", None),
    ("iphone", None),
    ("12345", None),
    ("SaMsUnG s23", "Samsung Galaxy S23"),
    ("IPHONE 14 PRO", "iPhone 14 Pro"),
    ("XiaOMi MI 11", "Xiaomi Mi 11"),
    ("one plus 11", "OnePlus 11"),
    ("xiaomi   redmi    note 10", "Xiaomi Redmi Note 10"),
    ("samsung galaxy", None),
    ("mi", None),
    ("oneplus", None)
])
def test_phone_normalizer(input_model, expected_output):
    """Test the PhoneNormalizer class directly."""
    result = PhoneNormalizer.normalize(input_model)
    assert result == expected_output, (
        f"Normalization failed for '{input_model}'\n"
        f"Expected: '{expected_output}'\n"
        f"Got:      '{result}'"
    )