import pytest
from actions.actions import ActionNormalizePhoneModel

@pytest.mark.parametrize("input_model, expected_output", [
    ("s23", "Samsung Galaxy S23"),
    ("galaxy s23", "Samsung Galaxy S23"),
    ("samsung s23", "Samsung Galaxy S23"),
    ("Samsung Galaxy S23 Ultra", "Samsung Galaxy S23 Ultra"),
    ("S20 FE", "Samsung Galaxy S20 Fe"),
    ("mi 11", "Xiaomi Mi 11"),
    ("redmi note 10", "Xiaomi Redmi Note 10"),
    ("iPhone 13 Pro Max", "iPhone 13 Pro Max"),
    ("iphone 14 pro", "iPhone 14 Pro"),
    ("random model", None),  # Should return None if not in the rules
])
def test_normalize_model(input_model, expected_output):
    action = ActionNormalizePhoneModel()
    normalized = action.normalize_model(input_model)
    assert normalized == expected_output, f"Expected '{expected_output}', got '{normalized}'"