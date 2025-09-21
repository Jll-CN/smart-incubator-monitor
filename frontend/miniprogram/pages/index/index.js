// index.js
// 获取应用实例
const app = getApp();
const KEY = "d2c63769d71d47973611db7a1727cb70";

import mqtt from "../../utils/mqtt.min";
const MQTTADDRESS = "你的mqtt服务器地址"; //mqtt服务器地址
let client = null; //mqtt服务
import { formatTime } from "../../utils/util";
import { add_record } from "../../api/index";

// console.log(formatTime(new Date()).slice(5));
Page({
  data: {
    title: "ESP32 + 微信小程序开发",
    welcome: "欢迎欢迎 今天的天气是晴",
    location: "无",
    temperature: 15,

    isConnect: false, //是否连接
    mqttContontDialog: false, //mqtt打开连接打开弹窗

    /* 设备信息 */
    sensorList: [
      //传感器列表
      //图 名字 参数 值 单位 超过阈值
      {
        img: "/images/P1.png",
        name: "DHT22",
        parameter: "温度",
        value: 0,
        unit: "°C",
        idx: 0
      },
      {
        img: "/images/P2.png",
        name: "DHT22",
        parameter: "湿度",
        value: 0,
        unit: "%rh",
        // isPass: true,
        idx: 1
      },
      {
        img: "/images/P3.png",
        name: "TEMT6000",
        parameter: "光强",
        value: 0,
        unit: "lx",
        idx: 2
      },
      {
        img: "/images/P4.png",
        name: "MQ2",
        parameter: "烟雾",
        value: 0,
        unit: "ppm",
        idx: 3
      }
    ],
    otherSensorList: [
      //其他设备
      {
        img: "/images/deng.png",
        name: "灯",
        isOpen: false
      },
      {
        img: "/images/fengshan.png",
        name: "风扇",
        isOpen: false
      },
      {
        img: "/images/chuanglian.png",
        name: "窗帘",
        schedule: 0, //进度条
        isOpen: false
      }
    ],

    isConnect: false, //是否连接
    isPush: false, //是否订阅
    isSubscr: false, //是否添加发布地址
    /* 连接输入框 */
    address: wx.getStorageSync("address") || "",
    port: wx.getStorageSync("port") || "",
    username: wx.getStorageSync("username") || "",
    password: wx.getStorageSync("password") || "",

    push: wx.getStorageSync("push") || "", //订阅地址
    subscr: wx.getStorageSync("subscr") || "", //发布地址

    thresholdDialog: false, //设置阈值弹窗
    clickIndex: 0, //点击的传感器设备下标
    top: "",
    bottom: ""
  },

  onLoad() {
    this.getUserLocation();
    if (
      wx.getStorageSync("address") &&
      wx.getStorageSync("port") &&
      wx.getStorageSync("username") &&
      wx.getStorageSync("password")
    ) {
      this.connectMqtt();
    }
  },
  /* 打开连接弹窗 */
  openDialog() {
    this.setData({
      mqttContontDialog: true
    });
  },
  onClose() {
    this.setData({
      mqttContontDialog: false
    });
  },
  getUserLocation: function () {
    let that = this;
    wx.getSetting({
      success: res => {
        // console.log(res, JSON.stringify(res));
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权

        if (
          res.authSetting["scope.userLocation"] != undefined &&
          res.authSetting["scope.userLocation"] != true
        ) {
          wx.showModal({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: "拒绝授权",
                  icon: "none",
                  duration: 1000
                });
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: "授权成功",
                        icon: "success",
                        duration: 1000
                      });
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: "授权失败",
                        icon: "none",
                        duration: 1000
                      });
                    }
                  }
                });
              }
            }
          });
        } else if (res.authSetting["scope.userLocation"] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        } else {
          //res.authSetting['scope.userLocation'] == true
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    });
  },
  getLocation() {
    let that = this;
    wx.getLocation({
      type: "wgs84",
      success(res) {
        // console.log("经纬度", res);
        if (res?.errMsg === "getLocation:ok") {
          /* ----------------通过经纬度获取地区编码---------------- */
          wx.request({
            url: "https://restapi.amap.com/v3/geocode/regeo?parameters",
            data: {
              key: KEY, //填入自己申请到的Key
              location: res.longitude + "," + res.latitude //传入经纬度
            },
            header: {
              "content-type": "application/json"
            },
            success: function (res) {
              // console.log("坐标转换和查询天气", res.data);
              wx.setStorageSync(
                "city",
                res.data.regeocode.addressComponent.adcode //地区编码
              );
              that.setData({
                location:
                  res.data.regeocode.addressComponent.city +
                  " " +
                  res.data.regeocode.addressComponent.district
              });

              wx.request({
                url: "https://restapi.amap.com/v3/weather/weatherInfo",
                data: {
                  key: KEY, //填入自己申请到的Key
                  city: res.data.regeocode.addressComponent.adcode //传入地区编码
                },
                header: {
                  "content-type": "application/json"
                },
                success: function (weather) {
                  // console.log("天气", weather.data);
                  that.setData({
                    temperature: weather.data.lives[0].temperature, //温度
                    weatherText: weather.data.lives[0].weather, //天气描述 晴天 下雨天...
                    welcome: "欢迎欢迎!今天的天气是 " + weather.data.lives[0].weather //欢迎语
                  });
                }
              });
            }
          });
        }
      }
    });
  },

  /* mqtt的连接 */
  connectMqtt() {
    let that = this;
    const options = {
      connectTimeout: 4000,
      address: this.data.address, //输入的地址
      port: this.data.port, //输入的端口号
      username: this.data.username, //输入的用户名
      password: this.data.password //输入的密码
    };

    console.log("address是：", "wxs://" + options.address + "/mqtt");
    client = mqtt.connect("wxs://" + options.address + "/mqtt", options); //连接 wxs://你的地址/mqtt
    client.on("connect", e => {
      console.log("连接成功");
      this.setData({
        isConnect: true
      });

      wx.setStorageSync("address", options.address);
      wx.setStorageSync("port", options.port);
      wx.setStorageSync("username", options.username);
      wx.setStorageSync("password", options.password);

      if (wx.getStorageSync("push")) {
        this.addPush();
      }
    });

    client.on("message", (topic, message) => {
      // console.log("收到消息：", message.toString());
      let getMessageObj = {}; //收到的消息
      getMessageObj = JSON.parse(message); //收到的消息转换成json对象
      console.log(getMessageObj);

      /* 
	  TEMPERATURE
      HUMIDITY
      LIGHT_INTENSITY
      SMOKE
			*/
      if (getMessageObj.hasOwnProperty("TEMPERATURE")) {
        that.setData({
          "sensorList[0].value": Number(getMessageObj.TEMPERATURE)
        });

        add_record("TEMPERATURE", Number(getMessageObj.TEMPERATURE));
      }
      if (getMessageObj.hasOwnProperty("HUMIDITY")) {
        that.setData({
          "sensorList[1].value": Number(getMessageObj.HUMIDITY)
        });
        add_record("HUMIDITY", Number(getMessageObj.HUMIDITY));
      }
      if (getMessageObj.hasOwnProperty("LIGHT_INTENSITY")) {
        that.setData({
          "sensorList[2].value": Number(getMessageObj.LIGHT_INTENSITY)
        });
        add_record("LIGHT_INTENSITY", Number(getMessageObj.LIGHT_INTENSITY));
      }
      if (getMessageObj.hasOwnProperty("SMOKE")) {
        that.setData({
          "sensorList[3].value": Number(getMessageObj.SMOKE)
        });
        add_record("SMOKE", Number(getMessageObj.SMOKE));
      }
    });

    client.on("reconnect", error => {
      console.log("正在重连：", error);
      wx.showToast({
        icon: "none",
        title: "正在重连"
      });
    });
    client.on("error", error => {
      console.log("连接失败：", error);
      wx.showToast({
        icon: "none",
        title: "mqtt连接失败"
      });
    });
  },
  closeConnect() {
    client.end(true);
    this.setData({
      isConnect: false,
      isPush: false,
      isSubscr: false
    });
  },
  /* 添加订阅 */
  addPush() {
    let that = this;
    //订阅一个主题
    if (!this.data.isConnect) {
      wx.showToast({
        icon: "none",
        title: "请先连接"
      });
      return;
    }
    client.subscribe(
      this.data.push,
      {
        qos: 0
      },
      function (err) {
        if (!err) {
          console.log("订阅成功");
          wx.showToast({
            icon: "none",
            title: "订阅成功"
          });
          that.setData({
            isPush: true
          });
          wx.setStorageSync("push", that.data.push);
        }
      }
    );
  },
  closePush() {
    let that = this;
    client.unsubscribe(this.data.push, function (err) {
      if (!err) {
        wx.showToast({
          icon: "none",
          title: "取消成功"
        });
        that.setData({
          isPush: false
        });
      }
    });
  },
  addSubscr() {
    if (!this.data.isConnect) {
      wx.showToast({
        icon: "none",
        title: "请先连接"
      });
      return;
    }
    let that = this;
    client.subscribe(
      this.data.subscr,
      {
        qos: 0
      },
      function (err) {
        if (!err) {
          // 发布消息
          console.log("添加成功");
          that.setData({
            isSubscr: true
          });
          wx.setStorageSync("subscr", that.data.subscr);
          // console.log("发出的", msg);
          // client.publish(this.data.subscr, JSON.stringify(msg)); //转换json格式
        }
      }
    );
  },
  systemChange(e) {
    let that = this;
    /* 
		
		{LIGHT: "ON"}  { LIGHT: "OFF" } 
		{ FAN: "ON" } { FAN: "OFF" } 
		{ CURTAIN: "ON" } { CURTAIN: "OFF" }
		*/
    let clickData = e.target.dataset.param;
    let value = e.detail.value;
    let msg;
    // console.log(clickData);
    if (clickData.name === "灯") {
      if (!value) {
        msg = {
          LIGHT: "OFF"
        };
      } else {
        msg = {
          LIGHT: "ON"
        };
      }
    }
    if (clickData.name === "风扇") {
      if (!value) {
        msg = {
          FAN: "OFF"
        };
      } else {
        msg = {
          FAN: "ON"
        };
      }
    }
    if (clickData.name === "窗帘") {
      if (!value) {
        msg = {
          CURTAIN: "OFF"
        };
      } else {
        msg = {
          CURTAIN: "ON"
        };
      }
    }

    client.subscribe(
      this.data.subscr,
      {
        qos: 0
      },
      function (err) {
        if (!err) {
          console.log("发出的", msg);
          client.publish(that.data.subscr, JSON.stringify(msg)); //转换json格式
        }
      }
    );
  },
  /* 点击传感器设置阈值 */
  clickSystem(e) {
    let data = e.currentTarget.dataset.param;
    let index = data.idx;
    console.log(data, index);
    this.setData({
      thresholdDialog: true,
      top: "",
      bottom: "",
      clickIndex: index
    });
  },
  /* 进入图表 */
  toChart(e) {
    let data = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: "/pages/record/record?data=" + JSON.stringify(data)
    });
  },
  /* 弹窗确定按钮 */
  thresholdDialogClose() {
    let [index, top, bottom] = [
      this.data.clickIndex,
      Number(this.data.top),
      Number(this.data.bottom)
    ];
    console.log(index, top, bottom);
    this.setData({
      ["sensorList[" + index + "].top"]: top,
      ["sensorList[" + index + "].bottom"]: bottom
    });
    console.log(this.data.sensorList);
  }
});
