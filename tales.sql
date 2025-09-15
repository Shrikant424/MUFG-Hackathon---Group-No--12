CREATE DATABASE UserData;
-- DROP DATAbaSE UserData;-- 
USE UserData;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    occupation VARCHAR(100),
    annualIncome DECIMAL(15,2),
    retirementAgeGoal INT,
    riskTolerance VARCHAR(20),
    investmentKnowledge VARCHAR(50),
    financialGoals TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    employmentStatus VARCHAR(50),
    currentSavings DECIMAL(15,2),
    maritalStatus VARCHAR(50),
    numberOfDependents INT,
    educationLevel VARCHAR(100),
    healthStatus VARCHAR(50),
    homeOwnershipStatus VARCHAR(50),
    monthlyExpenses DECIMAL(15,2),
    investmentExperience VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE TABLE chat_history(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    context JSON,
    CONSTRAINT fk_users FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE

);
-- ALTER TABLE profiles ADD UNIQUE (username);

SELECt * FROM users;
SELECT * FROM profiles;
SELECT * FROM chat_history;