import serial
import csv
import json
import time

ser = serial.Serial()
ser.baudrate=115200
ser.port="COM6"
ser.open()
ser.setDTR(True)
time.sleep(0.022)
ser.setDTR(False)
with open('user.json') as json_file:
    loaded = json.load(json_file)
    fname = './recorded/'+loaded["filename"]
    def runit():
        with open(fname, "w", newline='') as fp:
            wr = csv.writer(fp, dialect='excel')
            while(True):
                val =  ser.readline().decode("utf-8").split(',')
                if (len(val)==3):
                    val[2] = val[2].replace('\r\n', '')
                    wr.writerow(val)
                data = open('nuxtstat.json')
                data=data.readline()
                if data.startswith('f'):
                    ser.close()
                    return
    try:
        runit()
    except:
        runit()