import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography, Button, LinearProgress, CircularProgress } from "@mui/material";
import { getRecommendations } from "./services/api";

const DashboardPage = ({ username, profile }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback placeholders if profile not ready
  // Always use username from props if not present in profile
  const displayedProfile = {
    username: (profile && profile.username) || username,
    age: (profile && profile.age) || "-",
    retirementAgeGoal: (profile && profile.retirementAgeGoal) || "-",
    currentSavings: (profile && profile.currentSavings) || "-",
    annualIncome: (profile && profile.annualIncome) || "-",
    riskTolerance: (profile && profile.riskTolerance) || "-",
  };

  const currentAge = displayedProfile.age !== "-" ? displayedProfile.age : 30;
  const retirementAge = displayedProfile.retirementAgeGoal !== "-" ? displayedProfile.retirementAgeGoal : 65;
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const retirementProgress = Math.min(100, ((currentAge - 25) / (retirementAge - 25)) * 100);

  // Fetch recommendations dynamically
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const transformedProfile = {
          Age: profile.age,
          Annual_Income: profile.annualIncome || profile.annual_income || 0,
        };
        const recs = await getRecommendations(transformedProfile);
        setRecommendations(recs.recommendations || recs);
      } catch (err) {
        console.error("Failed to load recommendations", err);
        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, [profile]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome, {displayedProfile.username}</h1>

      {/* Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button style={buttonStyle} onClick={() => navigate("/update-profile")}>
          Update Profile
        </button>
        <button style={buttonStyle} onClick={() => navigate("/chat", { state: { profile: displayedProfile } })}> 
          Chat with Bot
        </button>
        <button
        style={{ ...buttonStyle, background: "#dc3545" }} // red for logout
        onClick={() => {
          window.location.href = "/";
        }}
      >
        🚪Logout
      </button>

      </div>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={cardStyle}>Age: {displayedProfile.age}</div>
        <div style={cardStyle}>Years to Retire: {yearsToRetire}</div>
        <div style={cardStyle}>
          Income: {displayedProfile.annualIncome !== "-" ? `$${displayedProfile.annualIncome}` : "-"}
        </div>
        <div style={cardStyle}>
          Current Savings: {displayedProfile.currentSavings !== "-" ? `$${displayedProfile.currentSavings}` : "-"}
        </div>
        <div style={cardStyle}>Risk Profile: {displayedProfile.riskTolerance || "-"}</div>
      </div>

      {/* Retirement Progress */}
      {displayedProfile.age !== "-" && displayedProfile.retirementAgeGoal !== "-" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 5 }}>Retirement Progress: Age {currentAge} → {retirementAge} ({retirementProgress.toFixed(1)}%)</div>
          <LinearProgress variant="determinate" value={retirementProgress} sx={{ height: 10, borderRadius: 5 }} />
        </div>
      )}

      {/* Recommendations */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}><CircularProgress /></div>
      ) : recommendations ? (
        <div style={cardStyle}>
          <strong>Recommendations of the Day:</strong>
          {recommendations.recommended_investments?.primary_recommendation ? (
            <div>
              <div>{recommendations.recommended_investments.primary_recommendation.name}</div>
              <div style={{ color: "#666" }}>{recommendations.recommended_investments.primary_recommendation.description}</div>
            </div>
          ) : (
            <div>No recommendations available</div>
          )}
        </div>
      ) : (
        <div style={{ color: "#666", marginBottom: 20 }}>Complete your profile to get recommendations</div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "10px 15px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  marginRight: 10,
};

const cardStyle = {
  padding: 20,
  border: "1px solid #ccc",
  borderRadius: 10,
  minWidth: 150,
  textAlign: "center",
  background: "#f8f8f8",
};

export default DashboardPage;
