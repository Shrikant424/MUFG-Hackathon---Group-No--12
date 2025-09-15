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
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={menuIconStyle}>☰</div>
            <h2 style={{ color: 'white', margin: 0, marginLeft: '15px', fontWeight: '500' }}>SuperAI Assistant</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontSize: '14px', background: '#ff4757', padding: '4px 8px', borderRadius: '12px' }}>
              Age {currentAge}
            </span>
            <div style={profileIconStyle}>👤</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Dashboard Title and Actions */}
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
            Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button style={primaryButtonStyle} onClick={() => navigate("/update-profile")}>
              Update Profile
            </button>
            <button style={chatButtonStyle} onClick={() => navigate("/chat", { state: { profile: displayedProfile } })}> 
              💬 Ask AI Advisor
            </button>
            <button style={logoutButtonStyle} onClick={() => { window.location.href = "/"; }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={statCardStyle}>
            <div style={{ ...iconCircleStyle, backgroundColor: '#4285f4' }}>🏛️</div>
            <div style={{ marginLeft: '15px' }}>
              <div style={statValueStyle}>
                {displayedProfile.currentSavings !== "-" ? `$${displayedProfile.currentSavings}` : "$100"}
              </div>
              <div style={statLabelStyle}>Current Balance</div>
              <div style={statSubtextStyle}>Superannuation balance</div>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconCircleStyle, backgroundColor: '#ea4335' }}>📈</div>
            <div style={{ marginLeft: '15px' }}>
              <div style={statValueStyle}>{yearsToRetire}</div>
              <div style={statLabelStyle}>Years to Retirement</div>
              <div style={statSubtextStyle}>Target age: {retirementAge}</div>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconCircleStyle, backgroundColor: '#34a853' }}>💰</div>
            <div style={{ marginLeft: '15px' }}>
              <div style={statValueStyle}>
                {displayedProfile.annualIncome !== "-" ? `$${displayedProfile.annualIncome}` : "$10,000"}
              </div>
              <div style={statLabelStyle}>Annual Income</div>
              <div style={statSubtextStyle}>Current salary</div>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconCircleStyle, backgroundColor: '#ff9800' }}>🎯</div>
            <div style={{ marginLeft: '15px' }}>
              <div style={statValueStyle}>{displayedProfile.riskTolerance || "Medium"}</div>
              <div style={statLabelStyle}>Risk Profile</div>
              <div style={statSubtextStyle}>Investment preference</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Retirement Progress */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>Retirement Journey Progress</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Age {currentAge} → {retirementAge}
                <span style={{ float: 'right', color: '#ea4335', fontWeight: '600' }}>
                  {retirementProgress.toFixed(1)}%
                </span>
              </div>
              <div style={{ backgroundColor: '#e3f2fd', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: '#2196f3',
                  height: '100%',
                  width: `${retirementProgress}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {yearsToRetire} years remaining until your target retirement age
            </div>
          </div>

          {/* Current Recommendation */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>Current Recommendation</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CircularProgress size={30} style={{ color: '#4285f4' }} />
              </div>
            ) : recommendations ? (
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
                  {recommendations.recommended_investments?.primary_recommendation?.name || "Balanced Growth"}
                </div>
                <div style={{ color: '#666', marginBottom: '15px' }}>
                  {recommendations.recommended_investments?.primary_recommendation?.description || 
                   "Balanced approach between growth and stability"}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ backgroundColor: '#4caf50', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                    6.8% return
                  </span>
                  <span style={{ backgroundColor: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                    0.75% fees
                  </span>
                </div>
                <button style={viewDetailsButtonStyle}>View Details</button>
              </div>
            ) : (
              <div style={{ color: '#666' }}>Complete your profile to get recommendations</div>
            )}
          </div>
        </div>

        {/* Bottom Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Portfolio Performance */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>Portfolio Performance Projection</h3>
            <div style={{ height: '150px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Chart placeholder - Performance data will be displayed here
            </div>
          </div>

          {/* Market Insights */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>Market Insights</h3>
            <div style={{ space: '10px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                • Inflation moderating but still above target ranges
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                • Central bank policy normalization continuing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const primaryButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#4285f4',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s',
};

const chatButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s',
};

const logoutButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s',
};

const statCardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
};

const iconCircleStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#2c3e50',
  marginBottom: '4px',
};

const statLabelStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#2c3e50',
  marginBottom: '2px',
};

const statSubtextStyle = {
  fontSize: '12px',
  color: '#7f8c8d',
};

const contentCardStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const cardTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '20px',
  margin: '0 0 20px 0',
};

const viewDetailsButtonStyle = {
  backgroundColor: 'transparent',
  color: '#4285f4',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  padding: '0',
};

export default DashboardPage;