#define LIGHTSENSORPIN 35 //Ambient light sensor reading
void setup()
{
    analogReadResolution(12);
    pinMode(LIGHTSENSORPIN, INPUT);
    Serial.begin(115200);
}
void loop()
{
    float reading = analogRead(LIGHTSENSORPIN)/4096.0*1000.0; //Read light level
    Serial.println(reading);
    delay(1000);
}
