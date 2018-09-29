/**
 *
 * @author 付颖志
 * @create 2018-09-17 下午5:24
 **/
var mongodb = require('./db');
//打开数据库
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

function Blog(obj) {
    this.title = obj.title; //博客标题
    this.content = obj.content; //博客内容
    this.author = obj.author;   //作者
    this.createTime = obj.createTime;   //发表时间
    this.type = obj.type;   //文章类型(原创：1，转载：2，翻译：3)

}

module.exports = Blog;

//存储用户信息
Blog.prototype.createOrModifyBlog = function (id, callback) {

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

        if(id == ''){
            //新增加博文
            dbase.collection("ID").find({}).toArray(function (err, ID) {

                let blogIndex = ID[1].index;
                //要存入数据库的用户文档
                let blogObj = {
                    id: blogIndex,
                    title: _this.title,
                    content: _this.content,
                    author: _this.author,
                    createTime: _this.createTime,
                    type: _this.type,
                };

                dbase.collection("blogs").insert(blogObj, function (err, blog) {
                    if (err) {
                        db.close();
                        return callback(err);//错误，返回 err 信息
                    }
                    //更新配置
                    dbase.collection("ID").update({id: 2}, {"id": 2, "index": ++blogIndex, "des": "记录博客的ID号"});
                    callback(null, blog);//成功！err 为 null，并返回存储后的用户文档

                });
            });
        }else {

        }


    });

};

//读取用户信息
Blog.prototype.get = function (name, callback) {

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


//读取所有博客信息
Blog.prototype.getAll = function ({}, callback) {

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
        dbase.collection("blogs").find({}).toArray(function (err, data) {
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
Blog.prototype.delete = function (id, callback) {

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
Blog.prototype.update = function (obj, callback) {

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

}
;