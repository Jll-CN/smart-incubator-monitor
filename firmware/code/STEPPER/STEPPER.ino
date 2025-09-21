#include <Stepper.h>

//定义引脚
#define PIN_LED 13
#define MOTOR_IN1 5
#define MOTOR_IN2 18
#define MOTOR_IN3 19
#define MOTOR_IN4 23
int a,b,s1,s2,s3;
int speed;
//定义电机转速
#define SPEED_FAST 235
#define SPEED_MIDDLE 100
#define SPEED_SLOW 40
#define SPEED_ZERO 0 
//定义电机旋转角度 2048一圈
#define THETA 400
// 设置步进电机旋转一圈是多少步
const int stepsPerRevolution = 100;   

//这里特别注意 ，后面4个参数分别是驱动板上的 IN1 , IN3 , IN2 , IN4 
Stepper myStepper = Stepper(stepsPerRevolution, MOTOR_IN1, MOTOR_IN2, MOTOR_IN3, MOTOR_IN4);


void setup() {

  //配置引脚输出
  pinMode(PIN_LED,OUTPUT);
  //设置步进电机转速
  myStepper.setSpeed(235); 
  //配置串口
  Serial.begin(115200);
  //配置语音模块
  delay(10);   
}

void loop() { 
  myStepper.setSpeed(SPEED_MIDDLE); 
  Serial.println("顺时针");
  myStepper.step(THETA);
  delay(2000);
  Serial.println("逆时针");
  myStepper.step(-THETA);
  delay(2000);
}
