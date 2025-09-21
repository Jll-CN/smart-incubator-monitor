import { getCurrYearMonthDate } from "../../utils/util";

const app = getApp();

Page({
  data: {
    showChart: false, // 控制图表显示隐藏
    sensorZhName: "", // 传感器英文名
    timeValue: getCurrYearMonthDate() //时间选择框的值
  },
  onLoad({ data }) {
    console.log(data);
    // console.log(JSON.parse(data));
    let { name, parameter, unit } = JSON.parse(data) || {};
    wx.setNavigationBarTitle({ title: `${parameter}记录（单位${unit}）` });
    this.setData({ sensorZhName: parameter, showChart: true });
  },
  bindDateChange(e) {
    this.setData({ showChart: false, timeValue: e.detail.value });
    setTimeout(() => {
      this.setData({ showChart: true });
    }, 500);
  }
});
