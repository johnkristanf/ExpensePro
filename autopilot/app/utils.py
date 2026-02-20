
def classify_user_input(user_input: str):
    ui_lower = user_input.lower().strip()
    is_approval = any(
        word in ui_lower for word in ["yes", "y", "confirm", "proceed", "ok"]
    )
    is_denial = any(word in ui_lower for word in ["no", "n", "cancel", "stop"])
    
    return is_approval, is_denial