import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import argrelextrema
from scipy import signal
from pandas import Series
import scipy.io as sio
import csv
import scipy
from scipy.io import loadmat
from biosppy.signals import ecg
from biosppy import storage
import sys

fnam = sys.argv[1]
fname = '../recorded/'+fnam
fnamex = './extracted/'+fnam[:len(fnam)-4]+'f.csv'

def avg_rising(GSR_vals, t):
    index = 1
    interval = np.array([])
    while index < np.shape(GSR_vals)[0]:
        if GSR_vals[index] > GSR_vals[index-1]:
            init_time = t[index]
            while GSR_vals[index] > GSR_vals[index-1] and index < np.shape(GSR_vals)[0] -1:
                index+=1
            final_time = t[index-1]
            interval = np.append(interval, (final_time-init_time)*0.001)
        index+=1
    return np.mean(interval)

def find_small_spectral_pow(GSR_vals,t):
    fs = 1/(np.mean(np.diff(t))*0.001)
    freq, spectra = signal.periodogram(GSR_vals, fs)
    freq = freq[0:82]
    spectra = spectra[0:82]
    return freq, np.log(spectra)/np.log(10)

def find_spectral_pow(GSR_vals,t):
    fs = 1/(np.mean(np.diff(t))*0.001)
    freq, spectra = signal.periodogram(GSR_vals, fs)
    freq = freq[0:488]
    spectra = spectra[0:488]
    return freq, np.log(spectra)/np.log(10)

def get_SCSR(normalized_GSR_vals, t):
    fs = 1/(np.mean(np.diff(t))*0.001)
    fc = 0.2
    norm_fc = fc/(fs/2)
    b, a = signal.butter(5, norm_fc, 'low')
    output = signal.filtfilt(b, a, normalized_GSR_vals)
    return output

def get_SCVSR(normalized_GSR_vals, t):
    fs = 1/(np.mean(np.diff(t))*0.001)
    fc = 0.08
    norm_fc = fc/(fs/2)
    b, a = signal.butter(5, norm_fc, 'low')
    output = signal.filtfilt(b, a, normalized_GSR_vals)
    return output

def getZeroCrossingRate(arr):
    my_array = np.array(arr)
    return float("{0:.2f}".format((((my_array[:-1] * my_array[1:]) < 0).sum())/len(arr)))

DataSet = pd.read_csv(fname, header=None)
Feature_Set = {}
t = DataSet.iloc[:,0]
t = (t[:] - t[0])
GSR_vals = DataSet.iloc[:,1]
c_GSR_vals = GSR_vals
GSR_vals= 1/GSR_vals
mean_skin_res = np.mean(GSR_vals)
der = (np.diff(GSR_vals)/np.diff(t))*1000
t_new = t[1:]
double_der = (np.diff(der)/np.diff(t_new))*1000
mean_der = np.mean(der)
mean_abs_der = np.mean(np.abs(der))
neg_der = np.array([])
for el in der:
    if el < 0:
        neg_der = np.append(neg_der, el)
neg_mean_der = np.mean(neg_der)
perc_neg_der = (np.shape(neg_der)[0]/np.shape(der)[0])*100
std_skin_res = np.std(GSR_vals)
num_c_min = np.shape(argrelextrema(np.array(c_GSR_vals), np.less))[1]
avg_rising_t = avg_rising(c_GSR_vals, t)
small_freq, small_spectral_power = find_small_spectral_pow(GSR_vals, t) 
idx = np.round(np.linspace(0, len(small_freq) - 1, 4)).astype(int)
small_freq = small_freq[idx]
small_spectral_power = small_spectral_power[idx]
std_skin_c = np.std(c_GSR_vals)
c_der = np.diff(c_GSR_vals)/np.diff(t)
mean_c_der = np.mean(c_der)
mean_abs_c_der = np.mean(np.abs(c_der))
double_c_der = np.diff(c_der)/np.diff(t_new) 
mean_double_c_abs_der = np.mean(np.abs(double_c_der))
num_min = np.shape(argrelextrema(np.array(GSR_vals), np.less))[1]
freq, spectral_power = find_spectral_pow(GSR_vals, t)
idx = np.round(np.linspace(0, len(freq) - 1, 10)).astype(int)
freq = freq[idx]
spectral_power = spectral_power[idx]
normalized_GSR_vals = (c_GSR_vals-np.amin(c_GSR_vals))/(np.amax(c_GSR_vals) - np.amin(c_GSR_vals))
SCSR = get_SCSR(normalized_GSR_vals, t)
SCVSR = get_SCVSR(normalized_GSR_vals, t)
zcr_SCSR = getZeroCrossingRate(SCSR)
Mean_SCSR = np.mean(SCSR)
zcr_SCVSR = getZeroCrossingRate(SCVSR)
Peak_SCVSR = np.amax(SCVSR)
Feature_Set['ftre'] = {'Mean_Skin_Resistance': mean_skin_res, 'Mean_Res_Derivative': mean_der, 'Mean_Res_Neg_Derivative': neg_mean_der, 'Percentage_of_Neg_Derivative_Samp': perc_neg_der, 'Std_Res': std_skin_res,  'No_of_Local_Minima_Skin_Cond': num_c_min, 'Avg_Rising_Time': avg_rising_t, 'Log_Power_Dens_0_to_0.4Hz': [small_freq, small_spectral_power], 'Std_Cond': std_skin_c,'Mean_Cond_Derivatives': mean_c_der,'Mean_Abs_Cond_Derivatives': mean_abs_c_der,'Mean_Abs_Cond_Second_Derivatives': mean_double_c_abs_der,'Num_Min_Res':num_min,'Log_Power_Dens_0_to_2.4Hz':[freq,spectral_power],'zcr_SCSR': zcr_SCSR,'Mean_SCSR':Mean_SCSR,'zcr_SCVSR':zcr_SCVSR,'Peak_SCVSR':Peak_SCVSR}
raw = pd.read_csv(fname)
channel1=np.array(raw.iloc[:,2])
timestamp=np.array(raw.iloc[:,0])
max_time = timestamp[len(timestamp)-1]- timestamp[0]
sampling_freq = 1000
num_data_points = sampling_freq* max_time/1000 * 1.1
num = int(num_data_points)
t1 = timestamp
c1 = channel1
f = signal.resample(x=c1, num=num, t=t1)
sig = f[0]*5
out = ecg.ecg(signal=sig, sampling_rate=sampling_freq, show=False)
r_peaks = out[2]- out[2][0]
IBI = []
for i in range(r_peaks.size-1):
    IBI.append(r_peaks[i+1]- r_peaks[i])
IBI = np.asarray(IBI)
IBI_MEAN = np.mean(IBI)
IBI_STD = np.std(IBI)
IBI_SKEW = scipy.stats.skew(IBI)
IBI_KURTOSIS = scipy.stats.kurtosis(IBI)
IBI_UP_Val = IBI_MEAN + IBI_STD 
count =0
for i in range(IBI.size):
    if (IBI[i]> IBI_UP_Val):
        count+=1
IBI_UP = count/IBI.size *100
IBI_DOWN_Val = IBI_MEAN - IBI_STD 
count = 0
for i in range(IBI.size):
    if (IBI[i]< IBI_DOWN_Val):
        count+=1
IBI_DOWN = count/IBI.size *100
HRV = []
for i in range(IBI.size-1):
    HRV.append(IBI[i+1]- IBI[i])
HRV = np.asarray(HRV)
HRV_MEAN = np.mean(HRV)
HRV_STD = np.std(HRV)
HRV_SKEW = scipy.stats.skew(HRV)
HRV_KURTOSIS = scipy.stats.kurtosis(HRV)
HRV_UP_Val = HRV_MEAN +HRV_STD 
count =0
for i in range(HRV.size):
    if (HRV[i]> HRV_UP_Val):
        count+=1
HRV_UP = count/HRV.size *100
HRV_DOWN_Val = HRV_MEAN - HRV_STD 
count =0
for i in range(HRV.size):
    if (HRV[i]< HRV_DOWN_Val):
        count+=1
HRV_DOWN = count/HRV.size *100
Heart_rate = 1/IBI*60*1000
Heart_rate_MEAN = np.mean(Heart_rate)
Heart_rate_STD = np.std(Heart_rate)
Heart_rate_SKEW = scipy.stats.skew(Heart_rate)
Heart_rate_KURTOSIS = scipy.stats.kurtosis(Heart_rate)
Heart_rate_UP_Val = Heart_rate_MEAN + Heart_rate_STD 
count =0
for i in range(Heart_rate.size):
    if (Heart_rate[i]> Heart_rate_UP_Val):
        count+=1
Heart_rate_UP = count/Heart_rate.size *100
Heart_rate_DOWN_Val = Heart_rate_MEAN - Heart_rate_STD 
count =0
for i in range(Heart_rate.size):
    if (Heart_rate[i]< Heart_rate_DOWN_Val):
        count+=1
Heart_rate_DOWN = count/Heart_rate.size *100
ECG_features = [IBI_MEAN]
ECG_features.append(IBI_STD)
ECG_features.append(IBI_SKEW)
ECG_features.append(IBI_KURTOSIS)
ECG_features.append(IBI_UP)
ECG_features.append(IBI_DOWN)
ECG_features.append(Heart_rate_MEAN)
ECG_features.append(Heart_rate_STD)
ECG_features.append(Heart_rate_SKEW)
ECG_features.append(Heart_rate_KURTOSIS)
ECG_features.append(Heart_rate_UP)
ECG_features.append(Heart_rate_DOWN)
ECG_features.append(HRV_MEAN)
ECG_features.append(HRV_STD)
ECG_features.append(HRV_SKEW)
ECG_features.append(HRV_KURTOSIS)
ECG_features.append(HRV_UP)
ECG_features.append(HRV_DOWN)
f_dash, Pxx_den = signal.welch(sig, fs =sampling_freq, nfft=100000)
Pxx_den = list(Pxx_den)
for i in range(5):
    ECG_features += Pxx_den[i]
for i in range(0, 255, 24):
    ECG_features += Pxx_den[i]
with open(fnamex, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow([ECG_features[0], ECG_features[1],ECG_features[2],ECG_features[3],ECG_features[4],ECG_features[5],ECG_features[6],ECG_features[7],ECG_features[8],ECG_features[9],ECG_features[10],ECG_features[11],ECG_features[12],ECG_features[13],ECG_features[14],ECG_features[15],ECG_features[16],ECG_features[17],ECG_features[18],ECG_features[19],ECG_features[20],ECG_features[21],ECG_features[22],ECG_features[23],ECG_features[24],ECG_features[25],ECG_features[26],ECG_features[27],ECG_features[28],ECG_features[29],ECG_features[30],ECG_features[31],ECG_features[32],ECG_features[33],ECG_features[34],ECG_features[35],Feature_Set['ftre']['Mean_Skin_Resistance'], Feature_Set['ftre']['Mean_Res_Derivative'], Feature_Set['ftre']['Mean_Res_Neg_Derivative'], Feature_Set['ftre']['Percentage_of_Neg_Derivative_Samp'], Feature_Set['ftre']['Std_Res'], Feature_Set['ftre']['No_of_Local_Minima_Skin_Cond'], Feature_Set['ftre']['Avg_Rising_Time'], Feature_Set['ftre']['Log_Power_Dens_0_to_0.4Hz'][1][0],Feature_Set['ftre']['Log_Power_Dens_0_to_0.4Hz'][1][1],Feature_Set['ftre']['Log_Power_Dens_0_to_0.4Hz'][1][2],Feature_Set['ftre']['Log_Power_Dens_0_to_0.4Hz'][1][3],Feature_Set['ftre']['Std_Cond'],Feature_Set['ftre']['Mean_Cond_Derivatives'],Feature_Set['ftre']['Mean_Abs_Cond_Derivatives'],Feature_Set['ftre']['Mean_Abs_Cond_Second_Derivatives'],Feature_Set['ftre']['Num_Min_Res'],Feature_Set['ftre']['Log_Power_Dens_0_to_2.4Hz'][1][0],Feature_Set['ftre']['Log_Power_Dens_0_to_2.4Hz'][1][1],Feature_Set['ftre']['Log_Power_Dens_0_to_2.4Hz'][1][2],Feature_Set['ftre']['Log_Power_Dens_0_to_2.4Hz'][1][3],Feature_Set['ftre']['zcr_SCSR'],Feature_Set['ftre']['Mean_SCSR'],Feature_Set['ftre']['zcr_SCVSR'],Feature_Set['ftre']['Peak_SCVSR']])