import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib

def train_model(model):
    models = {'lr':LogisticRegression(max_iter=11076),
              'rfc':RandomForestClassifier(n_estimators=1000,criterion='gini',random_state=42,oob_score=True),
              'xgbc':XGBClassifier(n_estimators=6000,random_state=42,max_depth=5,reg_alpha=0.0,reg_lambda=1.0,learning_rate=0.001,subsample=0.5)}
    df = pd.read_csv(r'D:\Work\Github\telco_customer_churn_prediction\data\all_features_target.csv')

    features = df.drop(columns=["Churn"])
    target = df["Churn"]

    x_train,na,y_train,na = train_test_split(features,target,test_size=0.3,random_state=1)
    
    M_model = models[model]
    M_model.fit(x_train,y_train)
    joblib.dump(M_model,f'{model}.pkl')
    return M_model

def predict_model(model):
    df = pd.read_csv(r'D:\\Work\\Github\\telco_customer_churn_prediction\\data\\all_features_target.csv')

    features = df.drop(columns=["Churn"])
    target = df["Churn"]

    na,x_test,na,y_test = train_test_split(features,target,test_size=0.3,random_state=1)
    
    return model.predict(x_test),model.score(x_test,y_test)

def new_pred(model,val):
    return model.predict(val)

def load_model(model):
    return joblib.load(f"{model}.pkl")

# train_model('lr')
# train_model('rfc')
# train_model('xgbc')
# pred,score1=predict_model(load_model('lr'))
# pred,score2=predict_model(load_model('rfc'))
# pred,score3=predict_model(load_model('xgbc'))
# print(score1,score2,score3)