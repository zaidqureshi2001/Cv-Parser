from agno.agent import Agent
from agno.models.groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

agent = Agent(
    model=Groq(id="llama3-8b-8192"),
    description="You are a helpful assistant"
)

prompt = "What's the capital of India?"
agent.run(prompt)

print("\n=== Groq Response ===")
print(agent.response if hasattr(agent, 'response') else str(agent))
