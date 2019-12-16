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
pca = PCA(n_components = 20)
hahv = pd.read_csv('hahv.csv', header=None)
hahv = np.array(hahv)
lahv = pd.read_csv('lahv.csv', header=None)
lahv = np.array(lahv)
halv = pd.read_csv('halv.csv', header=None)
halv = np.array(halv)
lalv = pd.read_csv('lalv.csv', header=None)
lalv = np.array(lalv)
test = pd.read_csv(fname, header=None)
test = np.array(test)
x = np.concatenate((hahv, halv, lahv, lalv, test))
# print(np.shape(x))
test = pca.fit_transform(x)
dicx = {}
dicx['A']=model_A.predict(test)[-1]
dicx['O']=model_O.predict(test)[-1]
dicx['E']=model_E.predict(test)[-1]
dicx['ES']=model_ES.predict(test)[-1]
dicx['C']=model_C.predict(test)[-1]
print(dicx)