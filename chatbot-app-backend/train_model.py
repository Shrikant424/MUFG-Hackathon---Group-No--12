import pandas as pd
import numpy as np
from model import SuperannuationPredictor
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def load_excel_data(file_path, sheet_name=None):
    """Load training data from Excel file"""
    try:
        # Load the Excel file
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            df = pd.read_excel(file_path)
        
        print(f"Loaded {len(df)} rows from Excel file: {file_path}")
        print(f"Columns found: {list(df.columns)}")
        
        return df
    
    except Exception as e:
        print(f"Error loading Excel file: {str(e)}")
        return None

def preprocess_excel_data(df):
    """
    Preprocess and validate the Excel data for training
    Modify this function based on your specific Excel column names and data format
    """
    # Make a copy to avoid modifying the original data
    processed_df = df.copy()
    
    # Example column mapping - modify these based on your actual Excel columns
    column_mapping = {
        # Map your Excel column names to the expected column names
        # Example mappings (update these to match your Excel file):
        'Age': 'Age',  # If your column is already named 'Age'
        'Gender': 'Gender',
        'Country': 'Country',
        'Employment_Status': 'Employment_Status',
        'Risk_Tolerance': 'Risk_Tolerance',
        'Annual_Income': 'Annual_Income',
        'Current_Savings': 'Current_Savings',
        'Retirement_Age_Goal': 'Retirement_Age_Goal',
        'Contribution_Amount': 'Contribution_Amount',
        'Years_Contributed': 'Years_Contributed',
        'Annual_Return_Rate': 'Annual_Return_Rate',
        'Projected_Pension_Amount': 'Projected_Pension_Amount',
        
        # Add more mappings as needed for your specific columns
        # 'YourExcelColumnName': 'ExpectedColumnName',
    }
    
    # Rename columns if needed
    existing_columns = {k: v for k, v in column_mapping.items() if k in processed_df.columns}
    processed_df = processed_df.rename(columns=existing_columns)
    
    # Data cleaning and preprocessing
    print("Preprocessing data...")
    
    # Remove rows with missing critical data
    critical_columns = ['Age', 'Annual_Income', 'Current_Savings']
    available_critical = [col for col in critical_columns if col in processed_df.columns]
    if available_critical:
        processed_df = processed_df.dropna(subset=available_critical)
        print(f"Removed rows with missing critical data. Remaining rows: {len(processed_df)}")
    
    # Convert data types
    numeric_columns = ['Age', 'Annual_Income', 'Current_Savings', 'Retirement_Age_Goal', 
                      'Contribution_Amount', 'Years_Contributed', 'Annual_Return_Rate',
                      'Projected_Pension_Amount']
    
    for col in numeric_columns:
        if col in processed_df.columns:
            processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    # Handle categorical variables
    categorical_columns = ['Gender', 'Country', 'Employment_Status', 'Risk_Tolerance',
                          'Marital_Status', 'Investment_Type', 'Education_Level']
    
    for col in categorical_columns:
        if col in processed_df.columns:
            processed_df[col] = processed_df[col].astype(str).str.strip()
    
    # Fill missing values with reasonable defaults or remove rows
    if 'Risk_Tolerance' in processed_df.columns:
        processed_df['Risk_Tolerance'] = processed_df['Risk_Tolerance'].fillna('Medium')
    
    if 'Gender' in processed_df.columns:
        processed_df['Gender'] = processed_df['Gender'].fillna('Not Specified')
    
    # Add derived features if they don't exist but can be calculated
    if 'Years_Contributed' not in processed_df.columns and 'Age' in processed_df.columns:
        processed_df['Years_Contributed'] = np.maximum(processed_df['Age'] - 22, 1)
        print("Added calculated 'Years_Contributed' column")
    
    if 'Annual_Return_Rate' not in processed_df.columns and 'Risk_Tolerance' in processed_df.columns:
        return_mapping = {'Low': 0.05, 'Medium': 0.07, 'High': 0.09}
        processed_df['Annual_Return_Rate'] = processed_df['Risk_Tolerance'].map(return_mapping).fillna(0.07)
        print("Added calculated 'Annual_Return_Rate' column based on Risk_Tolerance")
    
    # Remove any remaining rows with NaN in critical columns
    processed_df = processed_df.dropna(subset=['Age', 'Annual_Income', 'Current_Savings'])
    
    print(f"Final processed data shape: {processed_df.shape}")
    print("Sample of processed data:")
    print(processed_df.head())
    
    return processed_df

def validate_data(df):
    """Validate that the data has the required columns and reasonable values"""
    required_columns = ['Age', 'Annual_Income', 'Current_Savings']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"ERROR: Missing required columns: {missing_columns}")
        return False
    
    # Check for reasonable value ranges
    validation_checks = [
        (df['Age'] >= 18, "Age should be >= 18"),
        (df['Age'] <= 100, "Age should be <= 100"),
        (df['Annual_Income'] > 0, "Annual_Income should be > 0"),
        (df['Current_Savings'] >= 0, "Current_Savings should be >= 0"),
    ]
    
    for condition, message in validation_checks:
        if not condition.all():
            print(f"WARNING: Data validation issue - {message}")
            print(f"Problematic rows: {(~condition).sum()}")
    
    return True

def main():
    """Main function to load Excel data and train the model"""
    
    # MODIFY THIS PATH to point to your Excel file
    excel_file_path = r"problem_01.xlsx"  # Change this to your Excel file path
    sheet_name = None  # Change this if you want to specify a particular sheet
    
    print(f"Loading training data from Excel file: {excel_file_path}")
    
    # Load data from Excel
    raw_data = load_excel_data(excel_file_path, sheet_name)
    
    if raw_data is None:
        print("Failed to load Excel data. Please check the file path and format.")
        return
    
    print(f"Raw data shape: {raw_data.shape}")
    print("Raw data columns:", list(raw_data.columns))
    
    # Preprocess the data
    training_data = preprocess_excel_data(raw_data)
    
    if training_data.empty:
        print("No valid training data after preprocessing.")
        return
    
    # Validate the data
    if not validate_data(training_data):
        print("Data validation failed. Please check your Excel data.")
        return
    
    print(f"Successfully preprocessed {len(training_data)} training samples")
    
    # Initialize and train the model
    print("\nInitializing SuperannuationPredictor...")
    predictor = SuperannuationPredictor()
    
    print("Training the model...")
    training_results = predictor.train(training_data)
    
    if training_results.get('success'):
        print("Model training completed successfully!")
        print(f"Training metrics: {training_results['metrics']}")
        print(f"Features used: {training_results['features_used']}")
        print(f"Training samples: {training_results['training_samples']}")
        
        # Test the model with a sample prediction using first row of your data
        print("\nTesting model with sample from your data...")
        
        # Use the first row of your actual data as a test case
        first_row = training_data.iloc[0]
        test_profile = {
            'age': int(first_row.get('Age', 35)),
            'annual_income': float(first_row.get('Annual_Income', 70000)),
            'current_savings': float(first_row.get('Current_Savings', 50000)),
            'retirement_age_goal': int(first_row.get('Retirement_Age_Goal', 65)),
            'risk_tolerance': first_row.get('Risk_Tolerance', 'Medium'),
            'gender': first_row.get('Gender', 'Not Specified'),
            'country': first_row.get('Country', 'Australia'),
            'employment_status': first_row.get('Employment_Status', 'Full-time'),
            'marital_status': first_row.get('Marital_Status', 'Single'),
            'dependents': int(first_row.get('Number_of_Dependents', 0))
        }
        
        test_allocation = {
            'Australian Shares': 0.4,
            'International Shares': 0.3,
            'Australian Bonds': 0.2,
            'International Bonds': 0.05,
            'Property/REITs': 0.05,
            'Cash': 0.0
        }
        
        try:
            predictions = predictor.predict_future_value(test_profile, test_allocation)
            print("Sample prediction results:")
            print(f"Projected final balance: ${predictions['predictions']['projected_final_balance']:,.2f}")
            print(f"Expected annual return: {predictions['predictions']['expected_annual_return']:.2%}")
        except Exception as e:
            print(f"Error making test prediction: {str(e)}")
        
    else:
        print(f"Training failed: {training_results.get('error', 'Unknown error')}")

if __name__ == "__main__":
    main()