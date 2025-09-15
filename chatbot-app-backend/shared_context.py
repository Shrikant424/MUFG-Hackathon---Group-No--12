import json

# Shared conversation history for both LLM1 and LLM2 in OpenAI chat format
conversation_history = []

def add_to_history(role, content):
    """Add a message to the shared conversation history in OpenAI format"""
    message = {"role": role, "content": content}
    conversation_history.append(message)

def get_recent_history(limit=10):
    """Get recent conversation history with limit in OpenAI format"""
    return conversation_history[-limit:] if len(conversation_history) > limit else conversation_history

def get_conversation_json():
    """Get conversation history as JSON string for database storage"""
    return json.dumps(conversation_history, indent=2)

def clear_history():
    """Clear the conversation history"""
    global conversation_history
    conversation_history = []