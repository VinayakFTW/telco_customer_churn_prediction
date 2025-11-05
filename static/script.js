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

        const formData = collectFormData();
        console.log('Data to be sent:', formData);

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

            displayResult(data.prediction);

        } catch (error) {
            console.error('Prediction Error:', error);
            displayResult(-1, error.message);
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
        
        // Get simple 1:1 values
        const gender = document.getElementById('gender').checked ? 1 : 0;
        const seniorCitizen = document.getElementById('senior-citizen').checked ? 1 : 0;
        const partner = document.getElementById('partner').checked ? 1 : 0;
        const dependents = document.getElementById('dependents').checked ? 1 : 0;
        const tenure = parseInt(tenureSlider.value, 10);
        const phoneService = document.getElementById('phone-service').checked ? 1 : 0;
        const paperlessBilling = document.getElementById('paperless-billing').checked ? 1 : 0;
        let monthlyCharges = parseFloat(document.getElementById('monthly-charges').value);
        let totalCharges = parseFloat(document.getElementById('total-charges').value);

        if (isNaN(monthlyCharges)) {
            monthlyCharges = 0.0;
        }
        if (isNaN(totalCharges)) {
            totalCharges = 0.0;
        }

        // Internet Service
        const internetService = document.querySelector('input[name="internet-service"]:checked').value;
        const internetService_DSL = (internetService === 'dsl') ? 1 : 0;
        const internetService_Fiber = (internetService === 'fiber') ? 1 : 0;
        const internetService_No = (internetService === 'no') ? 1 : 0;
        const hasInternet = (internetService !== 'no');

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

        // Get checkbox states
        const multipleLinesChecked = document.getElementById('multiple-lines').checked;
        const onlineBackupChecked = document.getElementById('online-backup').checked;
        const deviceProtectionChecked = document.getElementById('device-protection').checked;
        const techSupportChecked = document.getElementById('tech-support').checked;
        const streamingTVChecked = document.getElementById('streaming-tv').checked;
        const streamingMoviesChecked = document.getElementById('streaming-movies').checked;

        // Multiple Lines
        const multipleLines_Yes = (phoneService === 1 && multipleLinesChecked) ? 1 : 0;
        const multipleLines_No = (phoneService === 1 && !multipleLinesChecked) ? 1 : 0;
        const multipleLines_No_phone_service = (phoneService === 0) ? 1 : 0;

        // Tech Support
        const techSupport_Yes = (hasInternet && techSupportChecked) ? 1 : 0;
        const techSupport_No = (hasInternet && !techSupportChecked) ? 1 : 0;
        const techSupport_No_internet_service = (!hasInternet) ? 1 : 0;

        // Online Backup
        const onlineBackup_Yes = (hasInternet && onlineBackupChecked) ? 1 : 0;
        const onlineBackup_No = (hasInternet && !onlineBackupChecked) ? 1 : 0;
        const onlineBackup_No_internet_service = (!hasInternet) ? 1 : 0;

        // Device Protection
        const deviceProtection_Yes = (hasInternet && deviceProtectionChecked) ? 1 : 0;
        const deviceProtection_No = (hasInternet && !deviceProtectionChecked) ? 1 : 0;
        const deviceProtection_No_internet_service = (!hasInternet) ? 1 : 0;

        // Streaming TV
        const streamingTV_Yes = (hasInternet && streamingTVChecked) ? 1 : 0;
        const streamingTV_No = (hasInternet && !streamingTVChecked) ? 1 : 0;
        const streamingTV_No_internet_service = (!hasInternet) ? 1 : 0;

        // Streaming Movies
        const streamingMovies_Yes = (hasInternet && streamingMoviesChecked) ? 1 : 0;
        const streamingMovies_No = (hasInternet && !streamingMoviesChecked) ? 1 : 0;
        const streamingMovies_No_internet_service = (!hasInternet) ? 1 : 0;

        const featuresObject = {
            'Partner': partner,
            'gender': gender,
            'Dependents': dependents,
            'PaperlessBilling': paperlessBilling,
            'PhoneService': phoneService,
            'InternetService_DSL': internetService_DSL,
            'InternetService_Fiber optic': internetService_Fiber,
            'InternetService_No': internetService_No,
            'PaymentMethod_Electronic check': payment_ElectronicCheck,
            'PaymentMethod_Mailed check': payment_MailedCheck,
            'PaymentMethod_Bank transfer (automatic)': payment_Bank,
            'PaymentMethod_Credit card (automatic)': payment_CreditCard,
            'Contract_Month-to-month': contract_Month,
            'Contract_One year': contract_OneYear,
            'Contract_Two year': contract_TwoYear,
            'TechSupport_No': techSupport_No,
            'TechSupport_Yes': techSupport_Yes,
            'TechSupport_No internet service': techSupport_No_internet_service,
            'OnlineBackup_Yes': onlineBackup_Yes,
            'OnlineBackup_No': onlineBackup_No,
            'OnlineBackup_No internet service': onlineBackup_No_internet_service,
            'DeviceProtection_No': deviceProtection_No,
            'DeviceProtection_Yes': deviceProtection_Yes,
            'DeviceProtection_No internet service': deviceProtection_No_internet_service,
            'MultipleLines_No phone service': multipleLines_No_phone_service,
            'MultipleLines_No': multipleLines_No,
            'MultipleLines_Yes': multipleLines_Yes,
            'StreamingTV_No': streamingTV_No,
            'StreamingTV_Yes': streamingTV_Yes,
            'StreamingTV_No internet service': streamingTV_No_internet_service,
            'StreamingMovies_No': streamingMovies_No,
            'StreamingMovies_Yes': streamingMovies_Yes,
            'StreamingMovies_No internet service': streamingMovies_No_internet_service,
            'SeniorCitizen': seniorCitizen,
            'tenure': tenure,
            'MonthlyCharges': monthlyCharges,
            'TotalCharges': totalCharges
        };

        // fit order
        const featureOrder = [
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
        ];

        const orderedFeatures = featureOrder.map(featureName => {
            return featuresObject[featureName];
        });

        return orderedFeatures;
    }
});