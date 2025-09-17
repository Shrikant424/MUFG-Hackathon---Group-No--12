import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import DashboardPage from "./Dashboard";
import UserDataForm from "./UserDataForm";
import ChatPage from "./chatbot/ChatbotPage";

function App() {
  const [username, setUsername] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 

  useEffect(() => {
    if (!username) return; 

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/profile/${username}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [username]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            username ? <Navigate to="/dashboard" /> : <AuthPage onLogin={setUsername} />
          }
        />
        <Route
          path="/dashboard"
          element={
            username ? (
              <DashboardPage username={username} profile={userProfile} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/update-profile"
          element={
            username ? (
              <UserDataForm username={username} setFormData={setUserProfile} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/chat"
          element={
            username ? (
              <ChatPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
