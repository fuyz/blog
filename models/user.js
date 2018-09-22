/**
 *
 * @author 付颖志
 * @create 2018-09-17 下午5:24
 **/
var mongodb = require('./db');
//打开数据库
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

let ID = 10001;

function User(user) {
    this.name = user.name;
    this.password = user.password;
    // this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    //要存入数据库的用户文档
    var user = {
        id: ID,
        name: this.name,
        password: this.password,
        // email: this.email
    };
    //打开数据库
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 users 集合
        var dbase = db.db("myblog");
        dbase.createCollection('users', function (err, res) {
            if (err) {
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            res.insert(user, {
                safe: true
            }, function (err, user) {
                db.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null, user.ops[0]);//成功！err 为 null，并返回存储后的用户文档
            });
            // db.close();
        });
    });

};

//读取用户信息
User.prototype.get = function(name, callback) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 users 集合
        var dbase = db.db("myblog");
        dbase.createCollection('users', function (err, res) {
            if (err) {
                db.close();
                return callback(err);//错误，返回 err 信息
            };
            console.log("创建/打开users集合!");

            //查找用户名（name键）值为 name 一个文档
            res.findOne({
                name: name
            }, function (err, user) {
                if (err) {
                    db.close();
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });

            // db.close();
        });
    });

};