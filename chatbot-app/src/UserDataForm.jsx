import React, { useState, useEffect } from "react";
import "./UserDataForm.css";

const UserDataForm = ({ setFormData, username }) => {  // add username prop
  const [formState, setFormState] = useState({
  name: "",
  age: "",
  gender: "Male",
  country: "Australia",
  employmentStatus: "Full-time",
  occupation: "",
  annualIncome: "",
  currentSavings: "",
  monthlyExpenses: "",
  email: "",
  phone: "",
  retirementAgeGoal: 65,
  riskTolerance: "Medium",
  maritalStatus: "Single",
  numberOfDependents: 0,
  educationLevel: "Bachelor's",
  healthStatus: "Good",
  homeOwnershipStatus: "Own",
  financialGoals: "Retirement",
  investmentExperience: "Intermediate",
  investmentKnowledge: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.age || !formState.annualIncome) {
      setMessage("Age and Annual Income are required.");
      return;
    }

    if (!username) {
      setMessage("Username not provided. Please login first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/profile/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      setLoading(false);

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.detail || "Failed to save profile.");
        return;
      }

      setMessage("Profile saved successfully!");
      setFormData(formState);
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>User Profile</h2>

      {/* Personal Info */}
      <section className="form-section">
        <h3>Personal Info</h3>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
        />

        <label>Age *</label>
        <input
          type="number"
          name="age"
          value={formState.age}
          onChange={handleChange}
          min="18"
          max="100"
          required
        />

        <label>Gender</label>
        <select name="gender" value={formState.gender} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Country</label>
        <input
          type="text"
          name="country"
          value={formState.country}
          onChange={handleChange}
        />

        <label>Marital Status</label>
        <select
          name="maritalStatus"
          value={formState.maritalStatus}
          onChange={handleChange}
        >
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>

        <label>Number of Dependents</label>
        <input
          type="number"
          name="numberOfDependents"
          value={formState.numberOfDependents}
          onChange={handleChange}
          min="0"
        />

        <label>Education Level</label>
        <select
          name="educationLevel"
          value={formState.educationLevel}
          onChange={handleChange}
        >
          <option value="High School">High School</option>
          <option value="Bachelor's">Bachelor's</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
        </select>

        <label>Health Status</label>
        <select
          name="healthStatus"
          value={formState.healthStatus}
          onChange={handleChange}
        >
          <option value="Poor">Poor</option>
          <option value="Fair">Fair</option>
          <option value="Good">Good</option>
          <option value="Excellent">Excellent</option>
        </select>

        <label>Home Ownership Status</label>
        <select
          name="homeOwnershipStatus"
          value={formState.homeOwnershipStatus}
          onChange={handleChange}
        >
          <option value="Own">Own</option>
          <option value="Rent">Rent</option>
          <option value="Mortgage">Mortgage</option>
        </select>
      </section>

      {/* Employment & Finance */}
      <section className="form-section">
        <h3>Employment & Finance</h3>
        <label>Occupation</label>
        <input
          type="text"
          name="occupation"
          value={formState.occupation}
          onChange={handleChange}
        />

        <label>Employment Status</label>
        <select
          name="employmentStatus"
          value={formState.employmentStatus}
          onChange={handleChange}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Self-employed">Self-employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Retired">Retired</option>
        </select>

        <label>Annual Income *</label>
        <input
          type="number"
          name="annualIncome"
          value={formState.annualIncome}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Current Savings</label>
        <input
          type="number"
          name="currentSavings"
          value={formState.currentSavings}
          onChange={handleChange}
          min="0"
        />

        <label>Monthly Expenses</label>
        <input
          type="number"
          name="monthlyExpenses"
          value={formState.monthlyExpenses}
          onChange={handleChange}
          min="0"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
        />

        <label>Phone</label>
        <input
          type="text"
          name="phone"
          value={formState.phone}
          onChange={handleChange}
        />

        <label>Investment Knowledge</label>
        <input
          type="text"
          name="investmentKnowledge"
          value={formState.investmentKnowledge}
          onChange={handleChange}
        />
      </section>

      {/* Retirement Planning */}
      <section className="form-section">
        <h3>Retirement Planning</h3>
        <label>Retirement Age Goal</label>
        <input
          type="number"
          name="retirementAgeGoal"
          value={formState.retirementAgeGoal}
          onChange={handleChange}
          min="50"
          max="80"
        />

        <label>Risk Tolerance</label>
        <select
          name="riskTolerance"
          value={formState.riskTolerance}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <label>Investment Experience</label>
        <select
          name="investmentExperience"
          value={formState.investmentExperience}
          onChange={handleChange}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>

        <label>Primary Financial Goal</label>
        <select
          name="financialGoals"
          value={formState.financialGoals}
          onChange={handleChange}
        >
          <option value="Retirement">Retirement</option>
          <option value="Home Purchase">Home Purchase</option>
          <option value="Education">Education</option>
          <option value="Travel">Travel</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Legacy Planning">Legacy Planning</option>
        </select>
      </section>

      {message && <p className="form-message">{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default UserDataForm;
