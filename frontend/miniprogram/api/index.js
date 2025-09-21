const BASE_URL = "http://localhost:3000/api";
const app = getApp();

export function get_records(sensor_name, create_time) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/get_records`,
      data: {
        sensor_name,
        create_time: `${create_time}`
      },
      success(response) {
        resolve(response);
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

export function del_record(id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/del_record`,
      method: "POST",
      data: {
        id
      },
      success(response) {
        wx.showToast({ title: "删除成功", icon: "none" });
        resolve();
      },
      fail(e) {
        wx.showToast({ title: "删除失败", icon: "none" });
        reject(e);
      }
    });
  });
}

export function add_record(sensor_name, sensor_value) {
  wx.request({
    url: `${BASE_URL}/add_record`,
    method: "POST",
    data: {
      sensor_name,
      sensor_value
    },
    success(response) {},
    fail(e) {}
  });
}

export function update_record(id, sensor_value) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/update_record`,
      method: "POST",
      data: {
        id,
        sensor_value
      },
      success(response) {
        resolve();
      },
      fail(e) {}
    });
  });
}
