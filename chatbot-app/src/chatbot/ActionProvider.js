
import { createChatBotMessage } from "react-chatbot-kit";
import { callLLM1, callLLM2 } from "./LLMService";

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  // Add or update user info in global state
  updateUserInfo(newInfo) {
    this.setState((prev) => ({
      ...prev,
      userData: { ...prev.userData, ...newInfo },
    }));
    this.addMessage(this.createChatBotMessage("✅ User info updated."));
  }
  
  addMessage(message) {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }

  async handleRiskAnalysis(userMessage) {
    // Add loading message
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, this.createChatBotMessage("🔍 Analyzing...")],
    }));

    // Get latest userData from state before making API call
    let userData = {};
    await new Promise((resolve) => {
      this.setState((prev) => {
        userData = prev.userData || {};
        resolve();
        return prev;
      });
    });

    try {
      const data = await callLLM1(userMessage, userData);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("", {
          widget: "markdownMessage",
          payload: { message: data }
        });
        return { ...prev, messages };
      });
    } catch (error) {
      console.error("Error:", error);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("Sorry, I'm having trouble connecting to my backend. Please try again later.");
        return { ...prev, messages };
      });
    }
  }

  async handleExplanation(userMessage) {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, this.createChatBotMessage("🔍 Analyzing...")],
    }));

    // Get latest userData from state before making API call
    let userData = {};
    await new Promise((resolve) => {
      this.setState((prev) => {
        userData = prev.userData || {};
        resolve();
        return prev;
      });
    });

    try {
      const data = await callLLM2(userMessage, userData);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("", {
          widget: "markdownMessage",
          payload: { message: data }
        });
        return { ...prev, messages };
      });
    } catch (error) {
      console.error("Error:", error);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("Sorry, I'm having trouble connecting to my backend. Please try again later.");
        return { ...prev, messages };
      });
    }
  }

    helloChat(){
        this.addMessage(this.createChatBotMessage("👋 Hello! How can i assist you?"));

    }
  exitChat(){
  const message = this.createChatBotMessage("👋 Goodbye! It was nice chatting with you.Feel free to ask me whatever you want!");
  this.addMessage(message);

  }

  async handleDefault(userMessage) {
    // 1. Always extract user info with LLM2
    let userData = {};
    await new Promise((resolve) => {
      this.setState((prev) => {
        userData = prev.userData || {};
        resolve();
        return prev;
      });
    });
    const extractionPrompt = `Extract all user profile information as JSON from: "${userMessage}". If nothing relevant, return an empty JSON object.`;
    let extractedObj = {};
    try {
      const llmExtracted = await callLLM2(extractionPrompt, userData);
      try {
        extractedObj = JSON.parse(llmExtracted);
      } catch (e) {
        // Not a valid JSON, skip
      }
      if (Object.keys(extractedObj).length > 0) {
        this.updateUserInfo(extractedObj);
        // Merge new fields into userData for next step
        userData = { ...userData, ...extractedObj };
      }
    } catch (e) {
      // Ignore extraction errors
    }

    // 2. If the message is a query (not just info update), call LLM1
    // Simple intent check: if message is exactly 'profile', 'show my data', or 'show my profile', skip LLM1
    const msg = userMessage.toLowerCase().trim();
    if (["profile", "show my data", "show my profile"].includes(msg)) {
      // Already handled by backend, do nothing here
      return;
    }

    // Otherwise, call LLM1 for advice
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, this.createChatBotMessage("🔍 Analyzing...")],
    }));
    try {
      const data = await callLLM1(userMessage, userData);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("", {
          widget: "markdownMessage",
          payload: { message: data }
        });
        return { ...prev, messages };
      });
    } catch (error) {
      console.error("Error:", error);
      this.setState((prev) => {
        const messages = [...prev.messages];
        messages[messages.length - 1] = this.createChatBotMessage("Sorry, I'm having trouble connecting to my backend. Please try again later.");
        return { ...prev, messages };
      });
    }
  }
}

export default ActionProvider;
