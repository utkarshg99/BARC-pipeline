import numpy as np
import scipy
from scipy.io import loadmat
import sklearn
from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer
from sklearn import metrics
import pandas as pd
from sklearn.externals import joblib
import sys

fname = sys.argv[1]
model_A = joblib.load('MODEL/Agreeableness.pkl')
model_O = joblib.load('MODEL/Openness.pkl')
model_E = joblib.load('MODEL/Extraversion.pkl')
model_ES = joblib.load('MODEL/Emotional_Stability.pkl')
model_C = joblib.load('MODEL/Conscientiousness.pkl')

test = pd.read_csv(fname)
test = np.array(test)
print(model_A.predict(test), model_O.predict(test), model_E.predict(test), model_ES.predict(test), model_C.predict(test))