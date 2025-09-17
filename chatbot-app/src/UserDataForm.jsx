import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDataForm.css";

const UserDataForm = ({ setFormData, username }) => {
  const navigate = useNavigate();
  
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
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={menuIconStyle}>☰</div>
            <h2 style={{ color: 'white', margin: 0, marginLeft: '15px', fontWeight: '500' }}>SuperAI Assistant</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={navButtonStyle} onClick={() => navigate("/dashboard")}>
              🏠 Dashboard
            </button>
            <button style={navButtonStyle} onClick={() => navigate("/chat")}>
              💬 Chat
            </button>
            <button style={{ ...navButtonStyle, backgroundColor: '#dc3545' }} onClick={() => { window.location.href = "/"; }}>
              🚪 Logout
            </button>
            <div style={profileIconStyle}>👤</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
            Update Profile
          </h1>
          <p style={{ color: '#666', fontSize: '16px', margin: '8px 0 0 0' }}>
            Keep your information up to date for better recommendations
          </p>
        </div>

        {/* Form Container */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit} style={formStyle}>
            {/* Personal Info Section */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <span style={sectionIconStyle}>👤</span>
                Personal Information
              </h3>
              
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Age *</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="age"
                    value={formState.age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                    required
                    placeholder="18"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Gender</label>
                  <select style={selectStyle} name="gender" value={formState.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Country</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="country"
                    value={formState.country}
                    onChange={handleChange}
                    placeholder="Australia"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Marital Status</label>
                  <select style={selectStyle} name="maritalStatus" value={formState.maritalStatus} onChange={handleChange}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Number of Dependents</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="numberOfDependents"
                    value={formState.numberOfDependents}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Education Level</label>
                  <select style={selectStyle} name="educationLevel" value={formState.educationLevel} onChange={handleChange}>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Health Status</label>
                  <select style={selectStyle} name="healthStatus" value={formState.healthStatus} onChange={handleChange}>
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Home Ownership Status</label>
                  <select style={selectStyle} name="homeOwnershipStatus" value={formState.homeOwnershipStatus} onChange={handleChange}>
                    <option value="Own">Own</option>
                    <option value="Rent">Rent</option>
                    <option value="Mortgage">Mortgage</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employment & Finance Section */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <span style={sectionIconStyle}>💼</span>
                Employment & Finance
              </h3>
              
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Occupation</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="occupation"
                    value={formState.occupation}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Employment Status</label>
                  <select style={selectStyle} name="employmentStatus" value={formState.employmentStatus} onChange={handleChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Annual Income *</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="annualIncome"
                    value={formState.annualIncome}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="50000"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Current Savings</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="currentSavings"
                    value={formState.currentSavings}
                    onChange={handleChange}
                    min="0"
                    placeholder="10000"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Monthly Expenses</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="monthlyExpenses"
                    value={formState.monthlyExpenses}
                    onChange={handleChange}
                    min="0"
                    placeholder="3000"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    placeholder="+61 400 000 000"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Investment Knowledge</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="investmentKnowledge"
                    value={formState.investmentKnowledge}
                    onChange={handleChange}
                    placeholder="Stocks, bonds, ETFs"
                  />
                </div>
              </div>
            </div>

            {/* Retirement Planning Section */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <span style={sectionIconStyle}>🎯</span>
                Retirement Planning
              </h3>
              
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Retirement Age Goal</label>
                  <input
                    style={inputStyle}
                    type="number"
                    name="retirementAgeGoal"
                    value={formState.retirementAgeGoal}
                    onChange={handleChange}
                    min="50"
                    max="80"
                    placeholder="65"
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Risk Tolerance</label>
                  <select style={selectStyle} name="riskTolerance" value={formState.riskTolerance} onChange={handleChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Investment Experience</label>
                  <select style={selectStyle} name="investmentExperience" value={formState.investmentExperience} onChange={handleChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Primary Financial Goal</label>
                  <select style={selectStyle} name="financialGoals" value={formState.financialGoals} onChange={handleChange}>
                    <option value="Retirement">Retirement</option>
                    <option value="Home Purchase">Home Purchase</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Legacy Planning">Legacy Planning</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div style={{
                ...messageStyle,
                backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
                color: message.includes('successfully') ? '#155724' : '#721c24',
                borderColor: message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'
              }}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button 
                type="button" 
                style={cancelButtonStyle}
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{
                  ...submitButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Styles
const headerStyle = {
  backgroundColor: '#4285f4',
  padding: '15px 20px',
  boxShadow: '0 2px 10px rgba(66, 133, 244, 0.2)',
};

const menuIconStyle = {
  color: 'white',
  fontSize: '18px',
  cursor: 'pointer',
};

const navButtonStyle = {
  padding: '8px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s',
};

const profileIconStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const formContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const formStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const sectionStyle = {
  marginBottom: '40px',
  paddingBottom: '30px',
  borderBottom: '1px solid #e9ecef',
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const sectionIconStyle = {
  fontSize: '24px',
};

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#2c3e50',
  marginBottom: '6px',
};

const inputStyle = {
  padding: '12px 16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: '#fafbfc',
};

const selectStyle = {
  padding: '12px 16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#fafbfc',
  cursor: 'pointer',
};

const messageStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid',
  fontSize: '14px',
  fontWeight: '500',
  marginTop: '20px',
};

const submitButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#4285f4',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.1s',
};

const cancelButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

export default UserDataForm;