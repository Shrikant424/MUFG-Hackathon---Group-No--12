import React, { useState } from "react";

export default function AuthForm({onLoginSuccess}) {
  const [isSignup, setIsSignup] = useState(false); // default: login screen
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:8000"; 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      setSuccess(data.message);
      onLoginSuccess(data.username); // ✅ notify parent with username
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.confirm) {
      return setError("All fields are required.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Signup failed");
        return;
      }

      const data = await res.json();
      setSuccess(data.message);
      setIsSignup(false); // switch back to login
      setForm({ username: "", password: "", confirm: "" });
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isSignup ? "Signup" : "Login"}</h2>
      <form onSubmit={isSignup ? handleSignup : handleLogin} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />
        {isSignup && (
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={handleChange}
            style={styles.input}
          />
        )}
        <button type="submit" style={styles.button}>
          {isSignup ? "Signup" : "Login"}
        </button>
      </form>

      {/* Toggle link */}
      <p style={styles.toggleText}>
        {isSignup ? (
          <>
            Already a user?{" "}
            <span style={styles.link} onClick={() => setIsSignup(false)}>
              Login
            </span>
          </>
        ) : (
          <>
            Not a user?{" "}
            <span style={styles.link} onClick={() => setIsSignup(true)}>
              Signup
            </span>
          </>
        )}
      </p>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "300px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: { color: "red", marginTop: "10px" },
  success: { color: "green", marginTop: "10px" },
  toggleText: { marginTop: "15px", fontSize: "14px" },
  link: { color: "#007bff", cursor: "pointer", textDecoration: "underline" },
};
