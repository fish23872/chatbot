from openai import OpenAI
import os

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=api_key)

class LlmActions:
    def create_response(prompt):
        response = client.responses.create(
            model="gpt-5.4-nano",
            input=prompt,
        )
        return response.output_text