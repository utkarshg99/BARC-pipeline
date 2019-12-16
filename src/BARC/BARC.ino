 double milli_time;

void setup() {
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  Serial.begin(115200);
//  Serial.println("CLEARDATA");
//  Serial.println("LABEL,Computer Time,Time (Milli Sec.),Volt");
}

void loop() {
  milli_time = micros();
//  Serial.print("DATA,TIME,");
  Serial.print(milli_time/1000);
  Serial.print(",");
  Serial.print(analogRead(A0));
  Serial.print(",");
  Serial.println(analogRead(A1));
//  delay(1);
}
