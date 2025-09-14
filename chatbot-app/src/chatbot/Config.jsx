import { createChatBotMessage } from "react-chatbot-kit";
import MarkdownMessage from "./components/MarkdownMessage";
import StockChart from "./components/StockChart";

const getConfig = (userData = {}) => ({
  botName: "PensionPal",
  initialMessages: [
    createChatBotMessage(
      `Hello ${userData.username || ""}! 👋 I can provide risk predictions, explain results, or analyze stock prices. Ask me about any stock!`
    ),
  ],
  state: {
    userData: { ...userData },
  },
  widgets: [
    {
      widgetName: "markdownMessage",
      widgetFunc: (props) => <MarkdownMessage {...props} />,
    },
    {
      widgetName: "stockChart",
      widgetFunc: (props) => <StockChart {...props} />,
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
});

export default getConfig;
