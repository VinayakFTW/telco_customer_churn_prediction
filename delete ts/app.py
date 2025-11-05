import pandas as pd
import joblib
from flask import Flask, request, jsonify, render_template
from model import load_model, new_pred # Imports functions from your model.py

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
        
        features_df = pd.DataFrame([data])
        
        if 'tenure' not in features_df.columns or 'MonthlyCharges' not in features_df.columns:
            return jsonify({'error': 'Missing required feature data.'}), 400

        prediction = new_pred(model, features_df)
        
        result = int(prediction[0]) 

        return jsonify({'prediction': result})
    
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 400
