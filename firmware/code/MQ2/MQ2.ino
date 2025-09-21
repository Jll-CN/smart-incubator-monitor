 #define MQ2pin 33
 float sensorValue;  //variable to store sensor value​
 void setup()
 {
   analogReadResolution(12);
   Serial.begin(115200); // sets the serial port to 9600
   Serial.println("Gas sensor warming up!");

   delay(20000); // allow the MQ-6 to warm up
 }
 void loop()
 {
   sensorValue = analogRead(MQ2pin)/4096.0*10000; // read analog input pin 0
   
   Serial.print("Sensor Value: ");
   Serial.print(sensorValue);
   
   if(sensorValue > 1500)
   {
     Serial.print(" | Smoke detected!");
   }
   
   Serial.println("");
   delay(2000); // wait 2s for next reading
 }