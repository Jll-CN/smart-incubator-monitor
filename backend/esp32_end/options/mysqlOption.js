const mysql = require("mysql");
let options = {
  host: "localhost",
  //port:"3306",// 可选，默认3306
  user: "root", // 这里改成你自己的数据库账号
  password: "admin", // 这里改成你自己的数据库密码
  database: "esp32_records", // 这里改成你自己的数据库的名字 不是表名
};

//创建与数据库进行连接的连接对象
const connection = mysql.createConnection(options);
module.exports = connection;