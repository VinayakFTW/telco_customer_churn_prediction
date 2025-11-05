from sklearn.preprocessing import OneHotEncoder,LabelEncoder
import pandas as pd

def onehot_trans(col,df):
    encoder = OneHotEncoder()
    enc_df = encoder.fit_transform(df[[col]]).toarray()
    colnames = df[f"{col}"].unique().tolist()
    colnames_new = []
    for cols in colnames:
        colnames_new.append(f"{col}_{cols}")
    enc_df = pd.DataFrame(enc_df,columns=colnames_new)
    return enc_df

def label_trans(col,df):
    encoder = LabelEncoder()
    enc_df = encoder.fit_transform(df[col])
    enc_df = pd.DataFrame(enc_df,columns=[f"{col}_enc"])
    return enc_df