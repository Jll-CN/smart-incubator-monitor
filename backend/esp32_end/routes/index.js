var express = require("express");
var router = express.Router();
const connection = require("../options/mysqlOption");
const handleData = require("../utils");

connection.connect((err) => {
  if (!err) {
    // 数据库连接成功
    console.log("数据库连接成功");
  } else {
    console.log("数据库连接失败", err);
  }
});

/* GET home page. */
router.get("/", function (req, res, next) {
  // // let sqlStr = "SELECT * FROM esp32_data";
  // // let sqlStr = "UPDATE esp32_data SET sensor_value = 999 WHERE id = 1;";
  // let sqlStr = "DELETE FROM esp32_data WHERE id = 1";

  // // let sqlStr = "INSERT INTO esp32_data (sensor_name,sensor_value) VALUES ('SMOKE', 20);";
  // connection.query(sqlStr, (err, result, fields) => {
  //   if (!err) {
  //     // 执行成功
  //     // console.log(result);
  //     // let resultData = result.map((item) => {
  //     //   return {
  //     //     ...item,
  //     //     create_time: handleData(item.create_time),
  //     //     update_time: handleData(item.update_time),
  //     //   };
  //     // });
  //     // res.json({ data: resultData });
  //     res.json({'msg':'操作成功'})
  //   }
  //   // 执行失败

  //   // res.json({'msg':'操作失败'})
  // });
  res.send("hello！");
});

/* 查询 */
router.get("/api/get_records", function (req, res, next) {
  let { sensor_name, create_time } = req.query;
  let sqlStr = `SELECT * FROM esp32_data WHERE sensor_name = '${sensor_name}' AND DATE(create_time) = '${create_time}'`;
  console.log(sqlStr);
  // http://localhost:3000/api/get_records?sensor_name=SMOKE&create_time=2024-02-28
  connection.query(sqlStr, (err, result, fields) => {
    if (!err) {
      console.log("查询结果：" + result.length + "条");
      // 对查询结果进行处理
      let resultData = result.map((item) => {
        return {
          ...item,
          create_time: handleData(item.create_time), // 调用工具函数处理时间
          update_time: handleData(item.update_time),
        };
      });

      res.json({ code: 200, msg: "查询成功", data: resultData });
      return;
    }
    res.json({ code: 404, msg: "查询失败" });
  });
});

/* 新增 */
router.post("/api/add_record", function (req, res, next) {
  // 从请求体中获取 sensor_name 和 sensor_value 的值
  let { sensor_name, sensor_value } = req.body;
  // 拼接 sql 语句
  let sqlStr = `INSERT INTO esp32_data (sensor_name,sensor_value) VALUES ('${sensor_name}', ${sensor_value});`;
  // 在控制台打印需要执行的 sql 语句
  console.log(sqlStr);
  // 执行sql语句 通过connection.query方法
  connection.query(sqlStr, (err, result, fields) => {
    if (!err) {
      // 如果没有错误，返回添加成功的信息
      res.json({ code: 200, msg: "添加成功" });
      return;
    }
    // 如果有错误，返回添加失败的信息
    res.json({ code: 404, msg: "添加失败" });
  });
});

/* 删除 */
router.post("/api/del_record", function (req, res, next) {
  let { id } = req.body;
  let sqlStr = `DELETE FROM esp32_data WHERE id = ${id}`;
  console.log(sqlStr);
  connection.query(sqlStr, (err, result, fields) => {
    if (!err) {
      res.json({ code: 200, msg: "删除成功" });
      return;
    }
    res.json({ code: 404, msg: "删除失败" });
  });
});

/* 修改 */
router.post("/api/update_record", function (req, res, next) {
  let { id, sensor_value } = req.body;
  let sqlStr = `UPDATE esp32_data SET sensor_value = ${sensor_value} WHERE id = ${id};`;
  console.log(sqlStr);
  connection.query(sqlStr, (err, result, fields) => {
    if (!err) {
      res.json({ code: 200, msg: "修改成功" });
      return;
    }
    res.json({ code: 404, msg: "修改失败" });
  });
});

module.exports = router;
