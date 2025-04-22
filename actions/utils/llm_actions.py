from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

class LlmActions:
    def create_response(prompt):
        response = client.responses.create(
            model="gpt-4.1-nano",
            input=prompt,
        )
        return response.output_text