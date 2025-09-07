import { createChatBotMessage } from "react-chatbot-kit";
import MarkdownMessage from "./components/MarkdownMessage";

const config = {
  botName: "PensionPal",
  initialMessages: [
    createChatBotMessage("Hello! 👋 I can provide risk predictions or explain results. What would you like?"),
  ],
  widgets: [
    {
      widgetName: "markdownMessage",
      widgetFunc: (props) => <MarkdownMessage {...props} />,
    },
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#2563eb",
    },
    chatButton: {
      backgroundColor: "#2563eb",
    },
  },
};

export default config;
