# from pandas import read_csv


# db = read_csv(r"C:\mydata\MUFG\Hackathon_Dataset.csv")
# conversation_history = []

# prompt = f"""
#     You are a financial assistant specializing in retirement and superannuation planning.
#     Always base your responses on the structured dataset provided below.
#     Do NOT use your own system location, and do NOT invent real-time market data or prices.

#     Dataset (from CSV):
#     {db}    

#     ### Your Responsibilities
#     1. **Retirement Outlook**
#     - Assess whether the user’s current contributions, savings rate, and chosen fund type are sufficient for achieving their retirement age goal.
#     - Identify strengths and gaps in their plan.

#     2. **Fund & Strategy Comparison**
#     - Compare the user’s current fund type (e.g., growth, balanced, conservative) against at least one alternative.
#     - Highlight differences in expected return, volatility, and risk profile.

#     3. **Personal Profile Alignment**
#     - Factor in ALL available user profile fields: country, age, gender, income, current savings, contribution rate, employment status, investment experience, risk tolerance, and retirement target age.
#     - Match recommendations to both the **financial capacity** and **risk appetite** of the user.

#     4. **Market & Historical Insights**
#     - Incorporate historical performance patterns and general market trends for the fund, stock, ETF, or bond listed in the dataset.
#     - For **stocks**, use the `Fund_Name` field to explain sector context, historical performance ranges, and common alternatives.
#     - For **ETFs or bonds**, reference their typical role in a retirement portfolio and historical return patterns.
#     - Do NOT provide real-time quotes, prices, or current market events.

#     5. **Personalized Recommendations & Predictive Insights**
#     - Suggest **actionable next steps** to improve contributions, diversify holdings, and rebalance portfolio.
#     - Recommend an **allocation breakdown** (e.g., % in growth vs conservative, % in stocks vs bonds).
#     - Provide both **short-term adjustments** (1–3 years) and **long-term strategies** (until retirement).
#     - Use predictive reasoning based on historical trends and general market knowledge to advise on likely outcomes.

#     6. **Education & Interaction**
#     - Explain concepts and investment reasoning clearly to improve the user’s financial literacy.
#     - Be interactive: respond naturally to follow-up questions and clarify any missing or ambiguous data.
#     - Handle natural language queries from users in an intuitive manner.

#     7. **Risks & Caveats**
#     - Clearly outline risks such as fund fees, market volatility, inflation, and potential underperformance.
#     - If any required data is missing in `{db}`, ask clarifying questions instead of guessing.

#     8. **Output Style**
#     - Write in a clear, structured, and easy-to-read format (use headings, bullet points, or sections).
#     - Compare options side by side where relevant (pros/cons table or bulleted differences).

#     9. **Disclaimer**
#     Always start but only once with disclaimer only repeat when user asks for it or it feels he is more dependent on this:
#     *“This is educational guidance, not professional financial advice.”*

#     Format your answer with Markdown headings, bullet points, and blank lines between paragraphs.

#     """

# def callLLM2(userMessage: str, userData: dict):
#     from openai import OpenAI

#     client = OpenAI(
#         base_url="https://openrouter.ai/api/v1",
#         api_key="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",
#     )

#     # Format user profile for prompt
#     if userData:
#         user_profile_str = "\\n".join([f"{k}: {v}" for k, v in userData.items()])
#         user_profile_section = f"\\n\\nUser Profile:\\n{user_profile_str}\\n"
#     else:
#         user_profile_section = "\\n\\nUser Profile: (not provided)\\n"

#     # Add user profile to the system prompt
#     full_prompt = prompt + user_profile_section

#     conversation_history.append({"role": "user", "content": userMessage})

#     messages = [{"role": "system", "content": full_prompt}]
#     messages.extend(conversation_history[-10:])

#     response = client.chat.completions.create(
#         model="deepseek/deepseek-r1-0528-qwen3-8b",
#         messages=messages
#     )

#     assistant_reply = response.choices[0].message.content
#     conversation_history.append({"role": "assistant", "content": assistant_reply})

#     print("Response generated")
#     return assistant_reply


# # async def callLLM2(userMessage: str, userData: dict, contextMessages: list = None):
# #     """
# #     Call LLM2 with proper message context
    
# #     Args:
# #         userMessage: Current user message
# #         userData: User profile data
# #         contextMessages: List of previous messages in OpenAI format [{"role": "user/assistant", "content": "..."}]
# #     """
# #     try:
# #         client = OpenAI(
# #             base_url="https://openrouter.ai/api/v1",
# #             api_key="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",
# #         )

# #         # Format user profile for prompt
# #         if userData:
# #             user_profile_str = "\n".join([f"{k}: {v}" for k, v in userData.items()])
# #             user_profile_section = f"\n\nUser Profile:\n{user_profile_str}\n"
# #         else:
# #             user_profile_section = "\n\nUser Profile: (not provided)\n"

# #         # Build messages array
# #         messages = [{"role": "system", "content": prompt + user_profile_section}]
        
# #         # Add context messages if provided
# #         if contextMessages:
# #             # Limit context to prevent token overflow (last 12 messages)
# #             recent_context = contextMessages[-12:] if len(contextMessages) > 12 else contextMessages
# #             messages.extend(recent_context)
        
# #         # Add current user message
# #         messages.append({"role": "user", "content": userMessage})

# #         response = client.chat.completions.create(
# #             model="deepseek/deepseek-r1-0528-qwen3-8b",
# #             messages=messages
# #         )

# #         assistant_reply = response.choices[0].message.content
# #         print(f"LLM2 Response generated (context messages: {len(contextMessages) if contextMessages else 0})")
# #         return assistant_reply
        
# #     except Exception as e:
# #         print(f"Error in callLLM2: {e}")
# #         raise e
from pandas import read_csv
from shared_context import add_to_history, get_recent_history


db = read_csv(r"C:\mydata\MUFG\Hackathon_Dataset.csv")

prompt = f"""
    You are a financial assistant specializing in retirement and superannuation planning.
    Always base your responses on the structured dataset provided below.
    Do NOT use your own system location, and do NOT invent real-time market data or prices.

    Dataset (from CSV):
    {db}    

    ### Your Responsibilities
    1. **Retirement Outlook**
    - Assess whether the user’s current contributions, savings rate, and chosen fund type are sufficient for achieving their retirement age goal.
    - Identify strengths and gaps in their plan.

    2. **Fund & Strategy Comparison**
    - Compare the user’s current fund type (e.g., growth, balanced, conservative) against at least one alternative.
    - Highlight differences in expected return, volatility, and risk profile.

    3. **Personal Profile Alignment**
    - Factor in ALL available user profile fields: country, age, gender, income, current savings, contribution rate, employment status, investment experience, risk tolerance, and retirement target age.
    - Match recommendations to both the **financial capacity** and **risk appetite** of the user.

    4. **Market & Historical Insights**
    - Incorporate historical performance patterns and general market trends for the fund, stock, ETF, or bond listed in the dataset.
    - For **stocks**, use the `Fund_Name` field to explain sector context, historical performance ranges, and common alternatives.
    - For **ETFs or bonds**, reference their typical role in a retirement portfolio and historical return patterns.
    - Do NOT provide real-time quotes, prices, or current market events.

    5. **Personalized Recommendations & Predictive Insights**
    - Suggest **actionable next steps** to improve contributions, diversify holdings, and rebalance portfolio.
    - Recommend an **allocation breakdown** (e.g., % in growth vs conservative, % in stocks vs bonds).
    - Provide both **short-term adjustments** (1–3 years) and **long-term strategies** (until retirement).
    - Use predictive reasoning based on historical trends and general market knowledge to advise on likely outcomes.

    6. **Education & Interaction**
    - Explain concepts and investment reasoning clearly to improve the user’s financial literacy.
    - Be interactive: respond naturally to follow-up questions and clarify any missing or ambiguous data.
    - Handle natural language queries from users in an intuitive manner.

    7. **Risks & Caveats**
    - Clearly outline risks such as fund fees, market volatility, inflation, and potential underperformance.
    - If any required data is missing in `{db}`, ask clarifying questions instead of guessing.

    8. **Output Style**
    - Write in a clear, structured, and easy-to-read format (use headings, bullet points, or sections).
    - Compare options side by side where relevant (pros/cons table or bulleted differences).

    9. **Disclaimer**
    Always start but only once with disclaimer only repeat when user asks for it or it feels he is more dependent on this:
    *“This is educational guidance, not professional financial advice.”*

    Format your answer with Markdown headings, bullet points, and blank lines between paragraphs.

    """

def callLLM2(userMessage: str, userData: dict):
    from openai import OpenAI

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="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",
    )

    # Format user profile for prompt
    if userData:
        user_profile_str = "\\n".join([f"{k}: {v}" for k, v in userData.items()])
        user_profile_section = f"\\n\\nUser Profile:\\n{user_profile_str}\\n"
    else:
        user_profile_section = "\\n\\nUser Profile: (not provided)\\n"

    # Add user profile to the system prompt
    full_prompt = prompt + user_profile_section

    add_to_history("user", userMessage)

    messages = [{"role": "system", "content": full_prompt}]
    messages.extend(get_recent_history(10))

    response = client.chat.completions.create(
        model="deepseek/deepseek-r1-0528-qwen3-8b",
        messages=messages
    )

    assistant_reply = response.choices[0].message.content
    add_to_history("assistant", assistant_reply)

    print("Response generated")
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




