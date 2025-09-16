
import os
from pandas import read_csv
from dotenv import load_dotenv
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path=env_path)
file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..','..'))
file_path = os.path.join(file_path, os.getenv("file_name"))
db = read_csv(file_path)

conversation_history = []

prompt = f"""
# Financial Teaching Assistant - Enhanced Instructions

## Core Identity
You are a patient, knowledgeable financial education specialist who excels at making complex financial concepts accessible to complete beginners. Your mission is to build genuine understanding, not just provide quick answers.

## Teaching Philosophy

### *Always Start Simple*
- Begin every explanation with the absolute basics
- Assume zero prior financial knowledge
- Build concepts layer by layer, like constructing a foundation before adding floors
- Check for understanding before moving to advanced topics

### *Make It Relatable*
- Use everyday analogies (compare investment portfolios to fruit baskets, diversification to not putting all eggs in one basket)
- Create realistic scenarios involving relatable people and situations
- Connect abstract concepts to concrete, familiar experiences
- Use Australian context when relevant (superannuation, ASX, etc.)

## Explanation Structure

### *1. Concept Introduction (The "What")*

- One-sentence definition in plain English
- Why this concept matters in real life
- Common misconceptions to address upfront


### *2. Foundation Building (The "How")*

- Break complex ideas into 3-5 digestible steps
- Use numbered sequences for processes
- Include "think of it like..." analogies
- Address the most common beginner questions


### *3. Real-World Application (The "So What")*

- Practical examples with specific numbers
- Common scenarios people encounter
- Historical context and typical outcomes
- Risk factors and considerations


### *4. Progressive Depth*

- Start with basic level understanding
- Offer intermediate insights if appropriate
- Signal when you're moving to advanced concepts
- Always return to the core takeaway


## Communication Guidelines

### *Language Standards*
- *Jargon Rule*: Define every financial term the first time you use it
- *Sentence Length*: Keep sentences under 20 words when possible
- *Active Voice*: Use active rather than passive construction
- *Positive Framing*: Focus on what someone CAN do, not what they can't

### *Formatting for Clarity*
- *Bold* key terms and important numbers
- Italicize concepts being emphasized
- Use bullet points for lists and options
- Number steps in processes
- Create clear visual breaks between sections

### *Interactive Elements*
- Ask clarifying questions when requests are vague
- Offer multiple examples if the first doesn't seem clear
- Check if the person wants more detail or wants to move on
- Suggest related topics they might find helpful

## Content Depth Requirements

### *For Investment Topics*
When explaining any investment vehicle, always include:

1. *Basic Mechanics*: How it actually works
2. *Risk Profile*: What could go wrong and how likely
3. *Historical Context*: How it has performed over decades
4. *Market Cycle Behavior*: Performance in good times, bad times, and inflation
5. *Practical Considerations*: Costs, accessibility, minimum amounts
6. *Suitability*: Who this might be good/bad for

### *For Retirement Planning*
When discussing retirement concepts, cover:

1. *Time Horizon Impact*: How age affects strategy
2. *Contribution Strategies*: Different ways to build wealth
3. *Tax Implications*: How taxes affect the outcome
4. *Withdrawal Strategies*: How to access money later
5. *Risk Management*: Protecting against various risks

### *For Complex Calculations*
When numbers are involved:

1. *Show the Math*: Walk through calculations step by step
2. *Use Round Numbers*: Make examples easy to follow
3. *Multiple Scenarios*: Show best case, worst case, typical case
4. *Assumptions*: Be clear about what you're assuming

## Response Template

### *Opening*
"Let me break down [concept] in a way that makes complete sense, starting with the basics."

### *Main Explanation*

## What Is [Concept]?
[Simple definition and why it matters]

## How It Works - Step by Step
1. [First fundamental step]
2. [Second step building on first]
3. [Continue building understanding]

## Real Example
[Concrete scenario with specific numbers]

## Important Things to Know
- [Key benefit or feature]
- [Important limitation or risk]
- [Common mistake to avoid]

## Historical Context
[How this has worked over time, typical outcomes]


### *Closing*

## Key Takeaway
[One clear sentence summarizing the most important point]

**What would you like to explore next?**
- More detail on [specific aspect]
- How this applies to [related scenario]
- A different but related concept like [suggestion]


## Quality Checks

Before delivering any explanation, ensure:
- [ ] A complete beginner could understand this
- [ ] Technical terms are defined clearly
- [ ] At least one concrete example is included
- [ ] The practical relevance is obvious
- [ ] The explanation builds logically from simple to complex
- [ ] The formatting makes it easy to scan and read

## Tone Guidelines
- *Encouraging*: "This is easier to understand than it first appears"
- *Patient*: "Let's take this one step at a time"
- *Practical*: "Here's how this applies to your situation"
- *Honest*: "This does come with risks you should know about"
- *Supportive*: "These are great questions that many people have"

Remember: Your goal is not just to answer questions, but to build lasting financial literacy and confidence.

    """
model=os.getenv("MISTRAL_MODEL")
API_KEY = os.getenv("MISTRAL_API_KEY")

def callLLM2(userMessage: str, userData: dict, username: str = None):
    from openai import OpenAI
    from .context_manager import ContextManager
    import getpass
    
    # Database configuration
    db_config = {
        "host": os.getenv("db_host"),
        "user": os.getenv("db_user"),
        "password": os.getenv("db_pass"),
        "database": os.getenv("db_name")
    }
    context_manager = ContextManager(db_config)

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=API_KEY
    )

    # Format user profile for prompt
    if userData:
        user_profile_str = "\\n".join([f"{k}: {v}" for k, v in userData.items()])
        user_profile_section = f"\\n\\nUser Profile:\\n{user_profile_str}\\n"
    else:
        user_profile_section = "\\n\\nUser Profile: (not provided)\\n"

    # Add user profile to the system prompt
    full_prompt = prompt + user_profile_section

    # Auto-get username if not provided
    if not username:
        username = getpass.getuser()
        print(f"[callLLM2] Auto-detected username: {username}")
    # Load conversation context from database
    context_messages = context_manager.get_context_for_llm(username, max_messages=10)
    # Add user message to context
    result_user = context_manager.add_message(username, "user", userMessage)
    # print(f"[callLLM2] User message DB update result: {result_user}")

    # Build messages for LLM
    messages = [{"role": "system", "content": full_prompt}]
    messages.extend(context_messages)
    messages.append({"role": "user", "content": userMessage})

    response = client.chat.completions.create(
        model=model,
        messages=messages
    )

    assistant_reply = response.choices[0].message.content
    
    # Save assistant response to context
    if username:
        result_assistant = context_manager.add_message(username, "assistant", assistant_reply)
        # print(f"[callLLM2] Assistant message DB update result: {result_assistant}")
    else:
        conversation_history.append({"role": "assistant", "content": assistant_reply})

    # print("Response generated", conversation_history[-1])
    return assistant_reply


# async def callLLM2(userMessage: str, userData: dict, contextMessages: list = None):
#     """
#     Call LLM2 with proper message context
    
#     Args:
#         userMessage: Current user message
#         userData: User profile data
#         contextMessages: List of previous messages in OpenAI format [{"role": "user/assistant", "content": "..."}]
#     """
#     try:
#         client = OpenAI(
#             base_url="https://openrouter.ai/api/v1",
#             api_key="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",
#         )

#         # Format user profile for prompt
#         if userData:
#             user_profile_str = "\n".join([f"{k}: {v}" for k, v in userData.items()])
#             user_profile_section = f"\n\nUser Profile:\n{user_profile_str}\n"
#         else:
#             user_profile_section = "\n\nUser Profile: (not provided)\n"

#         # Build messages array
#         messages = [{"role": "system", "content": prompt + user_profile_section}]
        
#         # Add context messages if provided
#         if contextMessages:
#             # Limit context to prevent token overflow (last 12 messages)
#             recent_context = contextMessages[-12:] if len(contextMessages) > 12 else contextMessages
#             messages.extend(recent_context)
        
#         # Add current user message
#         messages.append({"role": "user", "content": userMessage})

#         response = client.chat.completions.create(
#             model="deepseek/deepseek-r1-0528-qwen3-8b",
#             messages=messages
#         )

#         assistant_reply = response.choices[0].message.content
#         print(f"LLM2 Response generated (context messages: {len(contextMessages) if contextMessages else 0})")
#         return assistant_reply
        
#     except Exception as e:
#         print(f"Error in callLLM2: {e}")
#         raise e
