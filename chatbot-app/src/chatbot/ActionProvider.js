import { createChatBotMessage } from "react-chatbot-kit";
import { callLLM1, callLLM2 } from "./LLMService";

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }
  
  addMessage(message) {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }

  async handleRiskAnalysis(userMessage) {
    
    this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, this.createChatBotMessage("🔍 Analyzing...")],
    }));

    try {
        const data = await callLLM1(userMessage);

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

    try {
        const data = await callLLM2(userMessage);

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

  handleDefault(userMessage) {
    const message = this.createChatBotMessage(
      "I can either run a risk prediction or explain results. Try asking about risk or explanation."
    );
    this.addMessage(message);
  }
}

export default ActionProvider;
