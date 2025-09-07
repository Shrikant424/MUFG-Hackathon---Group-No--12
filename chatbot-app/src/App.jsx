import './App.css'
import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./chatbot/Config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";

function App() {
  return (
    <div className="App">
      <div className="chatbot-wrapper">
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
        />
      </div>
    </div>
  );
}

export default App;
