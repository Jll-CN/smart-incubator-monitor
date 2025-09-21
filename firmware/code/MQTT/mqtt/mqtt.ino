//WIFI 连接库和MQTT客户端
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DallasTemperature.h>
// WiFi 账号密码
const char *ssid = "heishuai"; // Wifi 账号
const char *password = "12345678";  // wifi 密码
 
// MQTT Broker 服务端连接
const char *mqtt_broker = "mqtt.icce.top";//mqtt服务器地址
const char *topic_subscribe = "ESP32PI/DRIVER";//主题
const char *topic_publish = "ESP32PI/SENSOR";//主题
const char *mqtt_username = "test7108";
const char *mqtt_password = "test123";
const int mqtt_port = 1883;//端口
 
//客户端变量
WiFiClient espClient;
PubSubClient client(espClient);
 
 
void setup() {
    //软串口波特率
    Serial.begin(115200);
    pinMode(0, OUTPUT);

    pinMode(15, OUTPUT);
    digitalWrite(15,LOW);
    pinMode(33, OUTPUT);
    digitalWrite(33,LOW);
    // connecting to a WiFi network
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println("Connecting to WiFi..");
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
    digitalWrite(33,LOW);
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
  Serial.println(state_light);


  if(state_light=="ON"){
      Serial.println("light on");
      digitalWrite(15,HIGH);
  }
  else if(state_light=="OFF"){
      Serial.println("light off");
      digitalWrite(15,LOW);
  } 

  if(state_fan=="ON"){
      Serial.println("fan on");
      digitalWrite(15,HIGH);
  }
  else if(state_fan=="OFF"){
      Serial.println("fan off");
      digitalWrite(15,LOW);
  } 


}
void loop() {
  if ( !client.connected() ) {
    reconnect();
  }
  client.publish(topic_publish, public_messages().c_str());
  delay(1000);
  client.loop();//循环

}

//发布消息
String public_messages() {
  static int flag=0;
  // Prepare gpios JSON payload string
  StaticJsonBuffer<256> jsonBuffer;
  JsonObject& data = jsonBuffer.createObject();
  data["TEMPERATURE"] = 1;//℃
  data["HUMIDITY"] = 2;//℃
  data["LIGHT_INTENSITY"] = 3;//℃
  data["SMOKE"] = 4;//℃


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
}