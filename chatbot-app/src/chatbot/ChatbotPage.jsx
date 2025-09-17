import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // add useNavigate
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import getConfig from "./Config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import './ChatPage.css';

const ChatPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate(); // for navigation
  const profile = location.state?.profile || props.userData || props.profile;
  const [chatHistory, setChatHistory] = useState([]);
const handleGoBack = async () => {
    try {
      const contextResponse = await fetch("http://127.0.0.1:8000/api/current-context");
      const contextData = await contextResponse.json();

      await fetch("http://127.0.0.1:8000/api/store-history/${profile.username}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: contextData.context }),
      });

      console.log("Global conversation context saved:", contextData.context);

      navigate(-1);
    } catch (err) {
      console.error("Failed to save conversation context", err);
    }
  };

  return (
      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <h2 style={styles.logo}>💸 PensionPal</h2>
          <div style={styles.userCard}>
            <div style={styles.avatar}>{profile?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div style={styles.username}>{profile?.username}</div>
              <div style={styles.status}>Online</div>
            </div>
          </div>
          {/* Go Back Button */}
          <button style={styles.goBackButton} onClick={handleGoBack}>
            ← Go Back
          </button>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          <div style={styles.chatHeader}>
            Talking with <span style={styles.chatUser}>{profile?.username}</span>
          </div>
          <div style={styles.chatboxWrapper}>
            <div style={styles.chatbox}>
              <Chatbot
                config={getConfig(profile)}
                messageParser={MessageParser}
                actionProvider={ActionProvider}
                messageHistory={chatHistory.length > 0 ? chatHistory : null}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#f4f6fb",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },
  sidebar: {
    width: "250px",
    background: "#1e293b",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "2px 0 6px rgba(0,0,0,0.15)",
  },
  logo: {
    fontSize: "22px",
    marginBottom: "30px",
    fontWeight: "600",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
    fontWeight: "600",
  },
  username: {
    fontSize: "16px",
    fontWeight: "500",
  },
  status: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  goBackButton: {
    marginTop: "20px",
    padding: "10px 15px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    padding: "15px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "16px",
    fontWeight: "500",
  },
  chatUser: {
    color: "#2563eb",
    fontWeight: "600",
  },
  chatboxWrapper: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
  },
  chatbox: {
    flex: 1,
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "600px",
    maxHeight: "600px",
    minHeight: "600px",
    position: "relative",
  },
};

export default ChatPage;