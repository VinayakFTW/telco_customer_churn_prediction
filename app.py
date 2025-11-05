import pandas as pd
import joblib
from flask import Flask, request, jsonify, render_template
from backend.model import load_model, new_pred

app = Flask(__name__)

try:
    model = load_model('lr')
except FileNotFoundError:
    print("FATAL: model.pkl not found. Please run train_model() from model.py first.")
    model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict', methods=['POST'])
def predict():  
    if model is None:
        return jsonify({'error': 'Model is not loaded.'}), 500

    try:
        data = request.get_json(force=True)
        
        feature_order = [
            'Partner', 'gender', 'Dependents', 'PaperlessBilling', 'PhoneService',
            'InternetService_DSL', 'InternetService_Fiber optic',
            'InternetService_No', 'PaymentMethod_Electronic check',
            'PaymentMethod_Mailed check', 'PaymentMethod_Bank transfer (automatic)',
            'PaymentMethod_Credit card (automatic)', 'Contract_Month-to-month',
            'Contract_One year', 'Contract_Two year', 'TechSupport_No',
            'TechSupport_Yes', 'TechSupport_No internet service',
            'OnlineBackup_Yes', 'OnlineBackup_No',
            'OnlineBackup_No internet service', 'DeviceProtection_No',
            'DeviceProtection_Yes', 'DeviceProtection_No internet service',
            'MultipleLines_No phone service', 'MultipleLines_No',
            'MultipleLines_Yes', 'StreamingTV_No', 'StreamingTV_Yes',
            'StreamingTV_No internet service', 'StreamingMovies_No',
            'StreamingMovies_Yes', 'StreamingMovies_No internet service',
            'SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges'
        ]

        if not isinstance(data, list) or len(data) != len(feature_order):
            return jsonify({'error': f'Invalid data format. Expected an array of {len(feature_order)} features.'}), 400

        features_df = pd.DataFrame([data], columns=feature_order)
        prediction = new_pred(model, features_df)
         
        result = int(prediction[0]) 

        return jsonify({'prediction': result})
    
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 400