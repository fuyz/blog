/**
 *
 * @author 付颖志
 * @create 2018-09-17 下午5:24
 **/
var mongodb = require('./db');
//打开数据库
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {

    let _this = this;
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //读取 users 集合
        var dbase = db.db("myblog");

        dbase.collection("ID").find({}).toArray(function (err, ID) {

            let maxId = ID[0].maxId;
            //要存入数据库的用户文档
            let user = {
                id: maxId,
                name: _this.name,
                password: _this.password,
                // email: this.email
            };

            dbase.collection("users").insert(user, function (err, user) {
                if (err) {
                    db.close();
                    return callback(err);//错误，返回 err 信息
                }
                //更新配置
                dbase.collection("ID").update({id: 1}, {"id": 1, "maxId": ++maxId, "des": "记录当前用户的id号"});
                callback(null, user.ops[0]);//成功！err 为 null，并返回存储后的用户文档

            });
        });

    });

};

//读取用户信息
User.prototype.get = function (name, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //读取 users 集合
        let dbase = db.db("myblog");
        dbase.collection("users").findOne({name: name}, function (err, res) {
            if (err) {
                db.close();
                return callback(err);//失败！返回 err 信息
            }
            callback(null, res);//成功！返回查询的用户信息
        });

    });
};


//读取所有用户信息
User.prototype.getAll = function ({}, callback) {

    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }

        //连接数据库
        let dbase = db.db("myblog");
        //读取 users 集合
        dbase.collection("users").find({}).toArray(function (err, data) {
            if (err) {
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            callback(null, data);//成功！返回查询的用户信息
        });

    })
    ;

};

//删除
User.prototype.delete = function (id, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 users 集合
        //读取 users 集合
        let dbase = db.db("myblog");
        let index = Number(id);
        try {
            dbase.collection("users").deleteOne({id: index}, function (err, result) {
                if (err) {
                    db.close();
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, result);//成功！返回查询的用户信息
            });
        } catch (e) {
            db.close();
            return callback(err);//失败！返回 err 信息
        }

    });

};

//更新
User.prototype.update = function (obj, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 users 集合
        //读取 users 集合
        let dbase = db.db("myblog");
        let index = Number(obj.id);
        try {
            dbase.collection("users").findOneAndUpdate(
                {id: index},
                {$set: {password: obj.password, email: obj.email}},
                { returnNewDocument : true },
                function (err, result) {
                    if (err) {
                        db.close();
                        return callback(err);//失败！返回 err 信息
                    }
                    callback(null, result);//成功！返回查询的用户信息
                }
            );
        }
        catch (e) {
            db.close();
            return callback(err);//失败！返回 err 信息
        }

    })
    ;

};