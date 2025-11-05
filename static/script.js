document.addEventListener('DOMContentLoaded', () => {

    // --- Get All DOM Elements ---
    const form = document.getElementById('churn-form');
    const predictBtn = document.getElementById('predict-btn');
    const btnText = predictBtn.querySelector('.btn-text');
    const loader = predictBtn.querySelector('.loader');
    const resultContainer = document.getElementById('result-container');
    const tenureSlider = document.getElementById('tenure');
    const tenureValue = document.getElementById('tenure-value');
    const internetServiceRadios = document.querySelectorAll('input[name="internet-service"]');
    const internetOptions = document.getElementById('internet-options');

    // --- Event Listeners ---

    // Update tenure slider value display
    tenureSlider.addEventListener('input', (e) => {
        tenureValue.textContent = e.target.value;
    });

    // Disable/Enable internet add-ons based on service
    internetServiceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'no') {
                internetOptions.style.opacity = '0.5';
                internetOptions.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                    cb.disabled = true;
                });
            } else {
                internetOptions.style.opacity = '1';
                internetOptions.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.disabled = false;
                });
            }
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop default form submission
        showLoading(true);
        hideResult();

        // 1. Collect and Encode Data
        const formData = collectFormData();

        // 2. Send Data to Flask API
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Something went wrong');
            }

            const data = await response.json();

            // 3. Display the Result
            displayResult(data.prediction);

        } catch (error) {
            console.error('Prediction Error:', error);
            displayResult(-1, error.message); // Show an error state
        } finally {
            showLoading(false);
        }
    });

    // --- Helper Functions ---

    function showLoading(isLoading) {
        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
            predictBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            predictBtn.disabled = false;
        }
    }

    function hideResult() {
        resultContainer.classList.add('hidden');
        resultContainer.classList.remove('result-safe', 'result-danger');
    }

    function displayResult(prediction, error = null) {
        const icon = resultContainer.querySelector('.result-icon i');
        const title = resultContainer.querySelector('.result-text h3');
        const description = resultContainer.querySelector('.result-text p');

        if (error) {
            resultContainer.classList.add('result-danger');
            icon.className = 'fas fa-exclamation-triangle';
            title.textContent = 'Prediction Failed';
            description.textContent = error;
        } else if (prediction === 1) {
            resultContainer.classList.add('result-danger');
            icon.className = 'fas fa-user-times';
            title.textContent = 'High Churn Risk';
            description.textContent = 'This customer is likely to churn.';
        } else {
            resultContainer.classList.add('result-safe');
            icon.className = 'fas fa-check-circle';
            title.textContent = 'Low Churn Risk';
            description.textContent = 'This customer is unlikely to churn.';
        }

        resultContainer.classList.remove('hidden');
    }

    function collectFormData() {
        // This function MUST create an object with the 26 feature names
        // that the preprocessed model was trained on.

        // Get simple 1:1 values
        const gender = document.getElementById('gender').checked ? 1 : 0;
        const seniorCitizen = document.getElementById('senior-citizen').checked ? 1 : 0;
        const partner = document.getElementById('partner').checked ? 1 : 0;
        const dependents = document.getElementById('dependents').checked ? 1 : 0;
        const tenure = parseInt(tenureSlider.value, 10);
        const phoneService = document.getElementById('phone-service').checked ? 1 : 0;
        const paperlessBilling = document.getElementById('paperless-billing').checked ? 1 : 0;
        const monthlyCharges = parseFloat(document.getElementById('monthly-charges').value);
        const totalCharges = parseFloat(document.getElementById('total-charges').value);

        // Get simple 'Yes'/'No'/'No Service' values
        // Note: 'No internet service' and 'No phone service' are both encoded as '0' in the sample
        // 'Yes' is 1. This logic assumes the 'No' (e.g. 'No internet') disables the sub-options.
        const multipleLines = document.getElementById('multiple-lines').checked ? 1 : 0;
        const onlineSecurity = document.getElementById('online-security').checked ? 1 : 0;
        const onlineBackup = document.getElementById('online-backup').checked ? 1 : 0;
        const deviceProtection = document.getElementById('device-protection').checked ? 1 : 0;
        const techSupport = document.getElementById('tech-support').checked ? 1 : 0;
        const streamingTV = document.getElementById('streaming-tv').checked ? 1 : 0;
        const streamingMovies = document.getElementById('streaming-movies').checked ? 1 : 0;


        // --- One-Hot Encoding ---

        // Internet Service
        const internetService = document.querySelector('input[name="internet-service"]:checked').value;
        const internetService_DSL = (internetService === 'dsl') ? 1 : 0;
        const internetService_Fiber = (internetService === 'fiber') ? 1 : 0;
        const internetService_No = (internetService === 'no') ? 1 : 0;

        // Contract
        const contract = document.querySelector('input[name="contract"]:checked').value;
        const contract_Month = (contract === 'month') ? 1 : 0;
        const contract_OneYear = (contract === 'one-year') ? 1 : 0;
        const contract_TwoYear = (contract === 'two-year') ? 1 : 0;

        // Payment Method
        const paymentMethod = document.getElementById('payment-method').value;
        const payment_Bank = (paymentMethod === 'bank-transfer') ? 1 : 0;
        const payment_CreditCard = (paymentMethod === 'credit-card') ? 1 : 0;
        const payment_ElectronicCheck = (paymentMethod === 'electronic-check') ? 1 : 0;
        const payment_MailedCheck = (paymentMethod === 'mailed-check') ? 1 : 0;


        // Assemble the final feature object.
        // The keys MUST match your model's training columns.
        // This is based on the 'preprocessed_telco_churn.csv' structure.
        return {
            'gender': gender,
            'SeniorCitizen': seniorCitizen,
            'Partner': partner,
            'Dependents': dependents,
            'tenure': tenure,
            'PhoneService': phoneService,
            'MultipleLines': multipleLines,
            'OnlineSecurity': onlineSecurity,
            'OnlineBackup': onlineBackup,
            'DeviceProtection': deviceProtection,
            'TechSupport': techSupport,     
            'StreamingTV': streamingTV,
            'StreamingMovies': streamingMovies,
            'PaperlessBilling': paperlessBilling,
            'MonthlyCharges': monthlyCharges,
            'TotalCharges': totalCharges,
            'InternetService_DSL': internetService_DSL,
            'InternetService_Fiber optic': internetService_Fiber,
            'InternetService_No': internetService_No,
            'Contract_Month-to-month': contract_Month,
            'Contract_One year': contract_OneYear,
            'Contract_Two year': contract_TwoYear,
            'PaymentMethod_Bank transfer (automatic)': payment_Bank,
            'PaymentMethod_Credit card (automatic)': payment_CreditCard,
            'PaymentMethod_Electronic check': payment_ElectronicCheck,
            'PaymentMethod_Mailed check': payment_MailedCheck
        };
    }
});