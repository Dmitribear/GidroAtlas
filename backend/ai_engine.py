import os

import openai

openai.api_key = os.getenv("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")


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

