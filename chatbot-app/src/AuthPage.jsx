import React from "react";
import SignupForm from "./SignupForm";

const AuthPage = ({ onLogin }) => {
  return <SignupForm onLoginSuccess={onLogin} />;
};

export default AuthPage;
