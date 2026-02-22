from tools.categories import create_category as create_category_tool, get_categories_by_name
from agents.expense.state import ExpenseState

class CategoriesNode:
    async def resolve_category(self, state: ExpenseState):
        result = await get_categories_by_name.ainvoke(
            {"name_query": state.get("category_name") or "None"}
        )

        if isinstance(result, str) and "No categories found" in result:
            return {"action": "create_category"}

        if isinstance(result, dict):
            category_id = result.get("id")
            if category_id:
                return {"category_id": category_id, "action": "resolve_budget"}

        return {"error": result if isinstance(result, str) else "Failed to resolve category."}

    async def create_category(self, state: ExpenseState):
        result = await create_category_tool.ainvoke(
            {"name": state["category_name"], "notes": None}
        )

        if isinstance(result, dict):
            category_id = result.get("id")
            if category_id:
                return {"category_id": category_id, "action": "resolve_budget"}

        return {"error": result if isinstance(result, str) else "Unknown error creating category"}
