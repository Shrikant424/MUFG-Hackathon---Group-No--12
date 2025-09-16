import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography, Button, LinearProgress, CircularProgress } from "@mui/material";
import { getRecommendations } from "./services/api";

const DashboardPage = ({ username, profile }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionError, setPredictionError] = useState(null);

  // Fallback placeholders if profile not ready
  // Always use username from props if not present in profile
  const displayedProfile = {
    username: (profile && profile.username) || username,
    age: (profile && profile.age) || 18, // Changed default to 18
    retirementAgeGoal: (profile && profile.retirementAgeGoal) || 65,
    currentSavings: (profile && profile.currentSavings) || 1000,
    annualIncome: (profile && profile.annualIncome) || 90000,
    riskTolerance: (profile && profile.riskTolerance) || "Medium",
  };

  const currentAge = displayedProfile.age;
  const retirementAge = displayedProfile.retirementAgeGoal;
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  
  // Fixed retirement progress calculation - should start from a reasonable working age
  const startingAge = 22; // Typical working start age
  const retirementProgress = currentAge <= startingAge ? 0 : 
    Math.min(100, ((currentAge - startingAge) / (retirementAge - startingAge)) * 100);

  // Fetch ML predictions with better error handling
  useEffect(() => {
    const loadPredictions = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPredictionError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/profile-with-predictions/${username}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.predictions && data.predictions.predictions) {
          // Validate numerical values and handle NaN
          const validatedPredictions = {
            ...data.predictions,
            predictions: {
              ...data.predictions.predictions,
              projected_final_balance: isNaN(data.predictions.predictions.projected_final_balance) 
                ? 0 : data.predictions.predictions.projected_final_balance,
              expected_annual_return: isNaN(data.predictions.predictions.expected_annual_return)
                ? 0.07 : data.predictions.predictions.expected_annual_return
            }
          };
          setPredictions(validatedPredictions);
        } else {
          setPredictionError("Unable to generate predictions. Please complete your profile.");
        }
      } catch (err) {
        console.error("Failed to load ML predictions", err);
        setPredictionError(`Failed to connect to prediction service: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadPredictions();
  }, [profile, username]);

  // Fetch recommendations (keeping original functionality)
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!profile) return;
      
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
      }
    };
    loadRecommendations();
  }, [profile]);

  const formatCurrency = (amount) => {
    // Handle NaN and invalid values
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  const formatPercentage = (value) => {
    // Handle NaN and invalid values
    const validValue = isNaN(value) || value === null || value === undefined ? 0 : value;
    return `${(validValue * 100).toFixed(1)}%`;
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
                {formatCurrency(displayedProfile.currentSavings)}
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
                {formatCurrency(displayedProfile.annualIncome)}
              </div>
              <div style={statLabelStyle}>Annual Income</div>
              <div style={statSubtextStyle}>Current salary</div>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconCircleStyle, backgroundColor: '#ff9800' }}>🎯</div>
            <div style={{ marginLeft: '15px' }}>
              <div style={statValueStyle}>{displayedProfile.riskTolerance}</div>
              <div style={statLabelStyle}>Risk Profile</div>
              <div style={statSubtextStyle}>Investment preference</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Retirement Progress - Fixed */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>Retirement Journey Progress</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Age {currentAge} → {retirementAge}
                <span style={{ float: 'right', color: retirementProgress > 50 ? '#27ae60' : '#e67e22', fontWeight: '600' }}>
                  {retirementProgress.toFixed(1)}%
                </span>
              </div>
              <div style={{ backgroundColor: '#e3f2fd', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: retirementProgress > 50 ? '#27ae60' : retirementProgress > 25 ? '#f39c12' : '#3498db',
                  height: '100%',
                  width: `${Math.max(2, retirementProgress)}%`, // Minimum 2% to show some progress
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {yearsToRetire > 0 ? `${yearsToRetire} years remaining until your target retirement age` : 'You have reached your target retirement age!'}
            </div>
            
            {/* Additional milestone indicators */}
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
              <span style={{ color: currentAge >= 30 ? '#27ae60' : '#bdc3c7' }}>30s ✓</span>
              <span style={{ color: currentAge >= 40 ? '#27ae60' : '#bdc3c7' }}>40s ✓</span>
              <span style={{ color: currentAge >= 50 ? '#27ae60' : '#bdc3c7' }}>50s ✓</span>
              <span style={{ color: currentAge >= 60 ? '#27ae60' : '#bdc3c7' }}>60s ✓</span>
            </div>
          </div>

          {/* ML Prediction Results - Fixed */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>🤖 AI Prediction Results</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CircularProgress size={30} style={{ color: '#4285f4' }} />
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Analyzing your profile...
                </div>
              </div>
            ) : predictionError ? (
              <div style={{ color: '#e74c3c', fontSize: '14px', padding: '15px', backgroundColor: '#fdf2f2', borderRadius: '8px', border: '1px solid #fadbd8' }}>
                ⚠️ {predictionError}
                <div style={{ marginTop: '10px' }}>
                  <button 
                    style={{ ...primaryButtonStyle, fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => navigate("/update-profile")}
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            ) : predictions && predictions.predictions ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                    Projected Final Balance
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60', marginBottom: '10px' }}>
                    {formatCurrency(predictions.predictions.projected_final_balance)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Expected Annual Return: {formatPercentage(predictions.predictions.expected_annual_return)}
                  </div>
                </div>

                {/* Scenarios */}
                {predictions.scenarios && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
                      Scenario Analysis
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {Object.entries(predictions.scenarios).map(([scenario, data]) => (
                        <div key={scenario} style={{ 
                          padding: '8px', 
                          borderRadius: '6px', 
                          backgroundColor: scenario === 'optimistic' ? '#d5f4e6' : scenario === 'pessimistic' ? '#fdf2f2' : '#f8f9fa',
                          border: `1px solid ${scenario === 'optimistic' ? '#27ae60' : scenario === 'pessimistic' ? '#e74c3c' : '#dee2e6'}`
                        }}>
                          <div style={{ fontSize: '12px', textTransform: 'capitalize', fontWeight: '600', marginBottom: '4px', color: '#2c3e50' }}>
                            {scenario}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: scenario === 'optimistic' ? '#27ae60' : scenario === 'pessimistic' ? '#e74c3c' : '#3498db' }}>
                            {formatCurrency(data.final_balance)}
                          </div>
                          <div style={{ fontSize: '10px', color: '#666' }}>
                            Annual: {formatCurrency(data.annual_retirement_income)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Level */}
                {predictions.model_confidence && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                      Prediction Confidence: {predictions.model_confidence.confidence_level || 'Medium'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Model accuracy: {((predictions.model_confidence.overall_confidence || 0.7) * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                <button style={viewDetailsButtonStyle} onClick={() => console.log('View detailed predictions:', predictions)}>
                  View Detailed Analysis
                </button>
              </div>
            ) : (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔮</div>
                <div>Complete your profile to see AI predictions</div>
                <button 
                  style={{ ...primaryButtonStyle, marginTop: '10px' }}
                  onClick={() => navigate("/update-profile")}
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Content Grid - Enhanced Portfolio Performance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Enhanced Portfolio Performance */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>📊 Portfolio Performance Projection</h3>
            {predictions && predictions.portfolio_evaluation ? (
              <div>
                {/* Visual Return Indicator */}
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    background: `conic-gradient(#27ae60 0deg ${(predictions.portfolio_evaluation.expected_annual_return * 100) * 3.6}deg, #ecf0f1 ${(predictions.portfolio_evaluation.expected_annual_return * 100) * 3.6}deg 360deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#27ae60'
                    }}>
                      {formatPercentage(predictions.portfolio_evaluation.expected_annual_return)}
                      <div style={{ fontSize: '10px', color: '#666' }}>Annual Return</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Expected Return</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#27ae60' }}>
                      {formatPercentage(predictions.portfolio_evaluation.expected_annual_return)}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Risk Level</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#e67e22' }}>
                      {formatPercentage(predictions.portfolio_evaluation.estimated_volatility)}
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Bar */}
                <div style={{ marginTop: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    Risk Assessment
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#ecf0f1', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (predictions.portfolio_evaluation.estimated_volatility || 0) * 500)}%`,
                      backgroundColor: (predictions.portfolio_evaluation.estimated_volatility || 0) > 0.15 ? '#e74c3c' : 
                                    (predictions.portfolio_evaluation.estimated_volatility || 0) > 0.08 ? '#f39c12' : '#27ae60',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>

                <div style={{ marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  Suitability: <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                    {predictions.portfolio_evaluation.suitability_rating || 'Good Match'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
                <div style={{ color: '#666', marginBottom: '15px' }}>
                  Performance analysis will appear here once predictions are loaded
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Expected return • Risk analysis • Portfolio suitability
                </div>
              </div>
            )}
          </div>

          {/* Contribution Analysis */}
          <div style={contentCardStyle}>
            <h3 style={cardTitleStyle}>💡 Contribution Strategy</h3>
            {predictions && predictions.contribution_analysis ? (
              <div>
                {Object.entries(predictions.contribution_analysis).slice(0, 2).map(([key, data]) => (
                  <div key={key} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                      {key.replace('_', ' ').toUpperCase()} STRATEGY
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Target Income</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#3498db' }}>
                          {formatCurrency(data.target_retirement_income)}/year
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Extra Monthly</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#e74c3c' }}>
                          {formatCurrency(data.additional_monthly_contribution_needed)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
                <div style={{ color: '#666', marginBottom: '15px' }}>
                  Personalized contribution strategies will appear here
                </div>
                <div style={{ fontSize: '14px', color: '#999', lineHeight: '1.4' }}>
                  • Complete your profile for personalized strategies<br/>
                  • AI will analyze optimal contribution amounts<br/>
                  • Get recommendations for different scenarios
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// All the existing styles remain the same
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