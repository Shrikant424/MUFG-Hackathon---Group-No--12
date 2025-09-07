import React, { useState } from "react";

const UserDataForm = ({ setFormData }) => {
  const [formState, setFormState] = useState({
    age: "",
    income: "",
    gender: "",
    country: "",
    annual_spending: "",
    retirement_goal: "",
    investment_experience: "",
    risk_tolerance: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData(formState); // Pass form data to App
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>User Information</h2>

      <input
        type="number"
        name="age"
        placeholder="Age"
        value={formState.age}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="income"
        placeholder="Annual Income"
        value={formState.income}
        onChange={handleChange}
        required
      />

      <select
        name="gender"
        value={formState.gender}
        onChange={handleChange}
        required
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <input
        type="text"
        name="country"
        placeholder="Country"
        value={formState.country}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="annual_spending"
        placeholder="Annual Spending"
        value={formState.annual_spending}
        onChange={handleChange}
      />

      <input
        type="number"
        name="retirement_goal"
        placeholder="Retirement Goal (in years)"
        value={formState.retirement_goal}
        onChange={handleChange}
      />

      <select
        name="investment_experience"
        value={formState.investment_experience}
        onChange={handleChange}
      >
        <option value="">Investment Experience</option>
        <option value="none">None</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="expert">Expert</option>
      </select>

      <select
        name="risk_tolerance"
        value={formState.risk_tolerance}
        onChange={handleChange}
      >
        <option value="">Risk Tolerance</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        style={{
          padding: "10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Start Chat
      </button>
    </form>
  );
};

export default UserDataForm;
