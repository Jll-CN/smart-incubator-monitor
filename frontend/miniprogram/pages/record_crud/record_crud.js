import { getCurrYearMonthDate } from "../../utils/util";
import { get_records, del_record, update_record } from "../../api/index";
Page({
  data: {
    title: "ESP32 + 微信小程序开发",

    revealList: ["列表", "图表"], // 数据展示模式
    revealTypeIndex: 0, // 连接方式的类型值 0列表 1图表
    showChart: false, // 控制图表显示隐藏

    timeValue: getCurrYearMonthDate(), //时间选择框的值

    sensorNameList: ["温度", "湿度", "光强", "烟雾"], //传感器下拉数据源
    sensorEnList: ["TEMPERATURE", "HUMIDITY", "LIGHT_INTENSITY", "SMOKE"], //传感器下拉数据源英文
    sensorNameIndex: "0", //传感器下拉值的index
    sensorNameEnValue: "TEMPERATURE",

    sensorMap: {
      TEMPERATURE: "°C",
      HUMIDITY: "%rh",
      LIGHT_INTENSITY: "lx",
      SMOKE: "ppm"
    }, //传感器单位

    sersorInfoList: [] // 数据列表
  },
  onLoad() {
    if (this.data.timeValue && this.data.sensorNameEnValue) this.selectData();
  },
  // 日期改变事件
  bindDateChange(e) {
    this.setData({ timeValue: e.detail.value });
    this.selectData();
  },
  // 传感器改变事件
  bindPickerChange(e) {
    this.setData({
      sensorNameIndex: e.detail.value,
      sensorNameEnValue: this.data.sensorEnList[Number(e.detail.value)]
    });
    this.selectData();
  },
  // 切换展示模式
  bindrevealTypeChange(e) {
    this.setData({ revealTypeIndex: Number(e.detail.value) });

    if (e.detail.value === "1") {
      this.setData({ showChart: true });
    }
  },
  // 获取数据记录
  selectData() {
    if (this.data.revealTypeIndex === 1) this.setData({ showChart: false });

    get_records(this.data.sensorNameEnValue, `${this.data.timeValue}`).then(response => {
      this.setData({ sersorInfoList: response.data.data });
      if (this.data.revealTypeIndex === 1) this.setData({ showChart: true });
    });
  },
  // 删除记录
  delRecord(e) {
    let that = this;
    wx.showModal({
      title: "系统提示",
      content: "是否确认删除本条消息",
      complete: res => {
        if (res.confirm) {
          del_record(e.currentTarget.dataset.id).then(() => {
            that.selectData();
          });
        }
      }
    });
  },
  // 修改记录
  updateRecord(e) {
    wx.showModal({
      title: "修改记录",
      editable: true,
      placeholderText: "请输入需要修改的值",
      confirmText: "确认修改",
      complete: res => {
        if (res.confirm) {
          if (res.content && !isNaN(Number(res.content))) {
            // console.log(Number(res.content));

            update_record(e.currentTarget.dataset.id, Number(res.content)).then(() => {
              wx.showToast({ title: "修改成功", icon: "none" });
              this.selectData();
            });
          } else {
            wx.showToast({ title: "输入有误", icon: "none" });
          }
        }
      }
    });
  }
});
