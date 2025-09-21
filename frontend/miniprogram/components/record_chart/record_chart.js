import * as echarts from "../../ec-canvas/echarts.min";
import { get_records } from "../../api/index";

const app = getApp();

const sensorMapObj = {
  温度: "TEMPERATURE",
  湿度: "HUMIDITY",
  光强: "LIGHT_INTENSITY",
  烟雾: "SMOKE"
};

/* 设置chart方法 */
function setOption(chart) {
  let option = {
    grid: { containLabel: true },
    tooltip: { show: true, trigger: "axis" },
    xAxis: { type: "category", data: ["none"] },
    yAxis: { type: "value" },
    series: [{ data: [0], type: "line" }],
    dataZoom: [
      { type: "slider", start: 0, end: 100 },
      { type: "inside", start: 0, end: 100 }
    ]
  };
  chart.setOption(option);
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sensorZhName: { type: String, value: "" }, // 传感器中文名字
    searchData: { type: String, value: "" }, //查询日期
    isNeedGetData: { type: Boolean, value: false }, // 是否需要接口获取数据
    chartData: { type: Array, value: () => [] } // 图表数据
    // myProperty2: String // 简化的定义方式
  },

  /**
   * 组件的初始数据
   */
  data: {
    ec: { lazyLoad: true }, // 将 lazyLoad 设为 true 后，需要手动初始化图表
    isLoaded: false,
    isDisposed: false,
    chartDataInData: []
  },

  lifetimes: {
    attached() {
      if (this.properties.isNeedGetData) {
        // console.log("从接口获取数据");
        get_records(sensorMapObj[this.properties.sensorZhName], this.properties.searchData).then(
          response => {
            this.setData({ chartDataInData: response.data.data });
          }
        );
      } else {
        this.setData({ chartDataInData: this.properties.chartData });
      }
    },
    ready() {
      // 获取组件节点
      this.ecComponent = this.selectComponent("#mychart-dom-bar");

      this.init();
      setTimeout(() => {
        console.log("图表数据", this.data.chartDataInData);
        this.data.chartDataInData.length &&
          this.chart?.setOption({
            xAxis: {
              type: "category",
              data: this.data.chartDataInData.map(item => item.create_time.slice(-5))
            },
            series: [
              {
                data: this.data.chartDataInData.map(item => item.sensor_value),
                type: "line"
              }
            ]
          });
      }, 1000);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击按钮后初始化图表
    init() {
      this.ecComponent.init((canvas, width, height, dpr) => {
        // 获取组件的 canvas、width、height 后的回调函数
        // 在这里初始化图表
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        setOption(chart);

        // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
        this.chart = chart;

        this.setData({ isLoaded: true, isDisposed: false });

        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return chart;
      });
    },

    dispose() {
      this.chart && this.chart.dispose();

      this.setData({ isDisposed: true });
    }
  }
});
