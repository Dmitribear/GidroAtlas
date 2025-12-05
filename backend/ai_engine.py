import os

from dotenv import load_dotenv
import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def analyze_object_openai(obj):
    prompt = f"""
    Ты — эксперт по гидротехническим сооружениям. 
    Дай вероятностный прогноз ухудшения состояния водного объекта.

    Формат ответа строго JSON:
    {{
        "risk_3_months": float,
        "risk_6_months": float,
        "risk_12_months": float,
        "risk_24_months": float,
        "explanation": "строка",
        "recommendation": "строка"
    }}

    Данные объекта:
    {obj}
    """

    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return eval(response.choices[0].message["content"])

