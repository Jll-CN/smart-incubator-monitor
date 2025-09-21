-- 创建数据库：用于存储ESP32传感器数据
CREATE DATABASE IF NOT EXISTS esp32_records
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci
  COMMENT 'ESP32传感器数据记录库';


-- 使用数据库
USE esp32_records;


-- 创建表：存储传感器上传的数据记录
CREATE TABLE IF NOT EXISTS `esp32_data` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键（无符号保证非负）',
    `sensor_name` VARCHAR(30) NOT NULL COMMENT '传感器名称（如：temperature/humidity）',
    `sensor_value` INT NOT NULL COMMENT '传感器数值（整数型测量值）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间（自动插入）',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间（自动更新）',
    PRIMARY KEY (`id`),
    INDEX `idx_sensor_name` (`sensor_name`),  -- 添加索引
    INDEX `idx_create_time` (`create_time`)   -- 时间字段添加索引
) ENGINE=InnoDB COMMENT='ESP32传感器数据记录表';