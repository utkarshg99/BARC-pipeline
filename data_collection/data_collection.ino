double milli_time;

void setup() {
  Serial.begin(115200);
}

void loop() {
  milli_time = micros()/1000.0;
  Serial.print(milli_time);
  Serial.print(",");
  Serial.print(analogRead(A0));
  Serial.print(",");
  Serial.println(analogRead(A6));
}
