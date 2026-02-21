from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from agents.expense.state import ExpensesListExtract

model = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY, 
    model="gpt-4o-mini", 
    temperature=0,
)

def load_expense_parser_model():
    return model.with_structured_output(ExpensesListExtract)


async def invoke_table_creator_model(list_data):
    with open("prompts/table_creator.md", "r") as f:
        table_creator_prompt = f.read()

    response = await model.ainvoke(
        [
            SystemMessage(content=table_creator_prompt),
            HumanMessage(content=f"Generate table for this data: {list_data}"),
        ]
    )
    table = response.content

    return table