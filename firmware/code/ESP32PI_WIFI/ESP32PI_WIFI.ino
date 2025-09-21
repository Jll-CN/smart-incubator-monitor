//WIFI 连接库和MQTT客户端
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
//#include <DallasTemperature.h>
#include "DHTesp.h" //引入DHTesp头文件，为下面调用函数做准备。


// WiFi 账号密码
const char *ssid = "TEST"; // Wifi 账号
const char *password = "12345678";  // wifi 密码
 
// MQTT Broker 服务端连接
const char *mqtt_broker = "esp.icce.top";//mqtt服务器地址
const char *topic_subscribe = "ESP32PI/DRIVER1";//主题
const char *topic_publish = "ESP32PI/SENSOR1";//主题
const char *mqtt_username = "esp32test2";
const char *mqtt_password = "test123";
const int mqtt_port = 1883;//端口
 
//客户端变量
WiFiClient espClient;
PubSubClient client(espClient);
 
//引脚绑定
#define MQ2PIN 32
#define LIGHTSENSORPIN 34 //Ambient light sensor reading
#define FANPIN 26
#define LIGHTPIN 25
#define DHTPIN 33
DHTesp dhtSensor; //定义一个DHT传感器
const int DHT22_PIN = DHTPIN; //定义一个整形变量，目的是使用GPIO-32来接收来自传感器的数据


int curtain_state=0;

void setup() {
    analogReadResolution(12);
    pinMode(LIGHTSENSORPIN, INPUT);
    pinMode(MQ2PIN, INPUT);
    dhtSensor.setup(DHT22_PIN, DHTesp::DHT22);//把DHT11与gpio第32号数字引脚关联。
    //软串口波特率
    Serial.begin(115200);
    pinMode(FANPIN,OUTPUT);
    digitalWrite(FANPIN,HIGH);
    pinMode(LIGHTPIN,OUTPUT);
    digitalWrite(LIGHTPIN,HIGH);

    // connecting to a WiFi network
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(2000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to the WiFi network");
    //connecting to a mqtt broker 连接服务端
    client.setServer(mqtt_broker, mqtt_port);
    client.setCallback(callback);//回调
    while (!client.connected()) {
        String client_id = "esp32-client-";
        client_id += String(WiFi.macAddress());
        Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
        if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
            Serial.println("Public emqx mqtt broker connected");
        } else {
            Serial.print("failed with state ");
            Serial.print(client.state());//返回连接状态
            delay(2000);
        }
    }
    // publish and subscribe
    client.subscribe(topic_subscribe);
}
 

// The callback for when a PUBLISH message is received from the server.
void callback(const char* topic, byte* payload, unsigned int length) {

  Serial.println("On message....");

  char json[length + 1];
  strncpy (json, (char*)payload, length);
  json[length] = '\0';

  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  Serial.println(json);


  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& data = jsonBuffer.parseObject((char*)json);

  if (!data.success())
  {
    Serial.println("parseObject() failed");
    return;
  }
    // Check request method
  String state_light= String((const char*)data["LIGHT"]);
  String state_fan=String((const char*)data["FAN"]);
  String state_curtain=String((const char*)data["CURTAIN"]);
  Serial.println(state_light);


  if(state_light=="ON"){
      Serial.println("light on");
      digitalWrite(LIGHTPIN,LOW);
  }
  else if(state_light=="OFF"){
      Serial.println("light off");
      digitalWrite(LIGHTPIN,HIGH);
  } 

  if(state_fan=="ON"){
      Serial.println("fan on");
      digitalWrite(FANPIN,LOW);
  }
  else if(state_fan=="OFF"){
      Serial.println("fan off");
      digitalWrite(FANPIN,HIGH);
  } 

  if(state_curtain=="ON"){
      Serial.println("curtain on");
      curtain_state=1;
  }
  else if(state_curtain=="OFF"){
      Serial.println("curtain off");
      curtain_state=0;
  } 


}
void loop() {
  if ( !client.connected() ) {
    reconnect();
  }
  client.publish(topic_publish, public_messages().c_str());
  delay(200);
  client.loop();//循环

}

//发布消息
String public_messages() {
  TempAndHumidity  dhtdata = dhtSensor.getTempAndHumidity();//接受来自传感器的温度湿度数据，存入data变量
  static int flag=0;
  static int progress=0;
  static int time_int=0;
  // Prepare gpios JSON payload string
  StaticJsonBuffer<256> jsonBuffer;
  JsonObject& data = jsonBuffer.createObject();


  if(time_int==5){
    time_int=0;
    data["TEMPERATURE"] = String(dhtdata.temperature,1);//℃
    data["HUMIDITY"] = String(dhtdata.humidity,1);//℃
    data["LIGHT_INTENSITY"] = String(analogRead(LIGHTSENSORPIN)/4096.0*1000.0,1); //Read light level
    data["SMOKE"] = String(analogRead(MQ2PIN)/4096.0*10000,2);
  }else
    time_int+=1;

  //步进电机圈数
  if(curtain_state==0&&progress!=0){
    progress-=1; 
  }
  if(curtain_state==1&&progress!=10){
    progress+=1; 
  }
  data["CURATIN_PROGRESS"] = String(progress*10);  

  char payload[256];
  data.printTo(payload, sizeof(payload));
  String strPayload = String(payload);
  Serial.print("publish message: ");
  Serial.println(strPayload);
  return strPayload;
}


void reconnect() {
  // Loop until we're reconnected
    while(!client.connected()) {
        String client_id = "esp32-client";
        client_id += String(WiFi.macAddress());
        Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
        if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
            Serial.println("Public emqx mqtt broker connected");
        } else {
            Serial.print("failed with state ");
            Serial.print(client.state());//返回连接状态
            delay(1000);
        }
    }
    client.subscribe(topic_subscribe);
}