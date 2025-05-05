from unittest.mock import MagicMock, patch
from bot.actions.actions import ActionRecommendByBudget

@patch("bot.actions.actions.db")
def test_premium_budget(mock_db):
    dispatcher = MagicMock()
    tracker = MagicMock()
    action = ActionRecommendByBudget()

    def get_slot_mock(key):
        return {
            "amount": None,
            "text_budget": "premium",
            "brand_preference": "Samsung",
            "usecase_description": "gaming"
        }[key]

    tracker.get_slot.side_effect = get_slot_mock

    mock_db.phones.find.return_value.sort.return_value.limit.return_value = [
        {
            "normalized_name": "Samsung Galaxy S24",
            "price": 1200,
            "review_score": 4.8,
            "discount": 0,
            "image_url": "some_url",
            "key_features": ["Snapdragon", "camera"],
            "purchase_url": "buy_url"
        }
    ]

    action.run(dispatcher, tracker, {})

    args, kwargs = dispatcher.utter_message.call_args
    assert "json_message" in kwargs
    assert kwargs["json_message"]["data"]["title"] == "📱 Premium Flagship Phones"