// import './App.css';
// import React, { useState } from "react";
// import UserProfile from "./UserProfile";
// import Chatbot from "react-chatbot-kit";
// import "react-chatbot-kit/build/main.css";
// import Dashboard from "./Dashboard";
// import getConfig from "./chatbot/Config";
// import MessageParser from "./chatbot/MessageParser";
// import ActionProvider from "./chatbot/ActionProvider";
// import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';


// function isProfileComplete(profile) {
//   if (!profile) return false;
//   const requiredFields = [
//     'age',
//     'gender',
//     'country',
//     'employmentStatus',
//     'annualIncome',
//     'currentSavings',
//     'retirementAgeGoal',
//     'riskTolerance',
//     'maritalStatus',
//     'numberOfDependents',
//     'educationLevel',
//     'healthStatus',
//     'homeOwnershipStatus',
//     'monthlyExpenses',
//     'financialGoals',
//     'investmentExperience'
//   ];
//   return requiredFields.every(
//     (field) => profile[field] !== undefined && profile[field] !== null && profile[field] !== ''
//   );
// }


// function App() {
//   const [profile, setProfile] = useState(() => {
//     const saved = localStorage.getItem('userProfile');
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [loading, setLoading] = useState(false);

//   // Placeholder: fetch user data from backend if registered
//   React.useEffect(() => {
//     if (profile && profile.registered) {
//       setLoading(true);
//       // --- BACKEND FETCH EXAMPLE ---
//       // fetch('http://localhost:8000/api/user', {
//       //   method: 'GET',
//       //   headers: {
//       //     'Authorization': `Bearer ${profile.token}` // if using JWT
//       //   }
//       // })
//       //   .then(res => res.json())
//       //   .then(data => {
//       //     setProfile(data);
//       //     localStorage.setItem('userProfile', JSON.stringify(data));
//       //   })
//       //   .catch(err => console.error('Failed to fetch user:', err))
//       //   .finally(() => setLoading(false));
//       setLoading(false);
//     }
//   }, [profile]);

//   // Only update profile and localStorage here
//   const handleProfileUpdate = (newProfile) => {
//     setProfile(newProfile);
//     localStorage.setItem('userProfile', JSON.stringify(newProfile));
//   };

//   // Helper component to render Chatbot with userProfile from navigation state
//   function ChatbotPage() {
//     const location = useLocation();
//     const userProfile = location.state?.userProfile || profile;
//     return (
//       <div className="chatbot-wrapper">
//         <Chatbot
//           config={getConfig(userProfile)}
//           messageParser={MessageParser}
//           actionProvider={ActionProvider}
//         />
//       </div>
//     );
//   }

//   // Always show form if profile is null, empty, or incomplete
//   if (!profile || Object.keys(profile).length === 0 || !isProfileComplete(profile)) {
//     return (
//       <div className="App">
//         <UserProfile onProfileUpdate={handleProfileUpdate} redirectToDashboard={true} />
//       </div>
//     );
//   }

//   // Show loading spinner if fetching from backend (future)
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <BrowserRouter>
//       <div className="App">
//         <Routes>
//           <Route
//             path="/userprofile"
//             element={<UserProfile onProfileUpdate={handleProfileUpdate} redirectToDashboard={true} />}
//           />
//           <Route
//             path="/chat"
//             element={<ChatbotPage />}
//           />
//           <Route
//             path="/"
//             element={<Dashboard userProfile={profile} />}
//           />
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;
//         // <div className="chatbot-wrapper">
//         //   <Chatbot
//         //     config={getConfig(formData)}
//         //     messageParser={MessageParser}
//         //     actionProvider={ActionProvider}
//         //   />
//         // </div>

// import './App.css';
// import React, { useState } from "react";
// import UserDataForm from "./UserDataForm";
// import Chatbot from "react-chatbot-kit";
// import "react-chatbot-kit/build/main.css";

// import config from "./chatbot/Config";
// import MessageParser from "./chatbot/MessageParser";
// import ActionProvider from "./chatbot/ActionProvider";

// function App() {
//   const [formData, setFormData] = useState(null);

//   return (
//     <div className="App">
//       {!formData ? (
//         <UserDataForm setFormData={setFormData} />
//       ) : (
//         <div className="chatbot-wrapper">
//           <Chatbot
//             config={config(formData)}      // pass form data in config
//             messageParser={MessageParser}   // just pass the class
//             actionProvider={ActionProvider} // just pass the class
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import DashboardPage from "./Dashboard";
import UserDataForm from "./UserDataForm";
import ChatPage from "./chatbot/ChatbotPage";

function App() {
  const [username, setUsername] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // store profile info

  // --- Fetch profile whenever username is set ---
  useEffect(() => {
    if (!username) return; // only fetch if username exists

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
