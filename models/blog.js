/**
 *
 * @author 付颖志
 * @create 2018-09-17 下午5:24
 **/
let mongodb = require('./db');
//打开数据库
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017";

function Blog(obj) {
    this.title = obj.title; //博客标题
    this.content = obj.content; //博客内容
    this.author = obj.author;   //作者
    this.createTime = obj.createTime;   //发表时间
    this.type = obj.type;   //文章类型(原创：1，转载：2，翻译：3)
    this.tags = obj.tags;   //标签数组
    this.privated = obj.privated;  //s是否私有
    this.drafts = obj.drafts;  //是否保存在草稿箱
    this.updatedTime = obj.updatedTime;  //修改时间
}

module.exports = Blog;

//存储、修改用户信息
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
        let dbase = db.db("myblog");

        if (id == '') {
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
                    tags: _this.tags,
                    privated: _this.privated,
                    drafts: _this.drafts,
                    updatedTime: _this.updatedTime
                };

                dbase.collection("blogs").insert(blogObj, function (err, blog) {
                    if (err) {
                        db.close();
                        return callback(err);//错误，返回 err 信息
                    }
                    //更新配置
                    dbase.collection("ID").update({id: 2}, {"id": 2, "index": ++blogIndex, "des": "记录博客的ID号"});
                    callback(null, blog);//成功！err 为 null，并返回存储后的用户文档
                    db.close();

                });
            });
        } else {
            //修改
            try {
                if (_this.drafts) {
                    //草稿箱 的修改
                    dbase.collection("blogs").findOneAndUpdate(
                        {id: Number(id)},
                        {
                            $set: {
                                title: _this.title,
                                content: _this.content,
                                author: _this.author,
                                createTime: _this.createTime,
                                type: _this.type,
                                tags: _this.tags,
                                privated: _this.privated,
                                drafts: _this.drafts,
                                updatedTime: _this.updatedTime

                            }
                        },
                        {returnNewDocument: true},
                        function (err, result) {
                            if (err) {
                                db.close();
                                return callback(err);//失败！返回 err 信息
                            }
                            callback(null, result);//成功！返回查询的用户信息
                            db.close();

                        }
                    );
                } else {
                    dbase.collection("blogs").findOneAndUpdate(
                        {id: Number(id)},
                        {
                            $set: {
                                title: _this.title,
                                content: _this.content,
                                author: _this.author,
                                // createTime: _this.createTime,
                                type: _this.type,
                                tags: _this.tags,
                                privated: _this.privated,
                                drafts: _this.drafts,
                                updatedTime: _this.updatedTime

                            }
                        },
                        {returnNewDocument: true},
                        function (err, result) {
                            if (err) {
                                db.close();
                                return callback(err);//失败！返回 err 信息
                            }
                            callback(null, result);//成功！返回查询的用户信息
                            db.close();

                        }
                    );
                }

            } catch (e) {
                db.close();
                return callback(err);//失败！返回 err 信息
            }

        }

    });

};

//读取用户信息
Blog.prototype.getOne = function (id, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //读取 myblog 集合
        let dbase = db.db("myblog");
        dbase.collection("blogs").findOne({id: Number(id)}, function (err, res) {
            if (err) {
                db.close();
                return callback(err);//失败！返回 err 信息
            }
            callback(null, res);//成功！返回查询的用户信息
            db.close();

        });

    });
};

//读取所有博客信息
Blog.prototype.getAll = function (obj, callback) {

    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        //读取 myblog 集合
        dbase.collection("blogs").find({author: obj.author}).sort({"_id": -1}).toArray(function (err, data) {
            if (err) {
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            callback(null, data);//成功！返回查询的用户信息
            db.close();

        });
    });

};

//获取文章类型总数
Blog.prototype.getType = function (obj, callback) {
    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        let data = {};
        //读取 myblog 集合
        let promise1 = new Promise((resolve, reject) => {
            dbase.collection("blogs").find({
                "author": obj.author,
                "type": '1',
                "deleted": {$ne: true},
                "drafts": {$ne: true},
                "privated": {$ne: true}
            }).count(function (err, result) {
                if (err) {
                    reject();
                }
                data.type1 = result;
                resolve();
            });
        });
        let promise2 = new Promise((resolve, reject) => {
            dbase.collection("blogs").find({
                "author": obj.author,
                "type": '2',
                "deleted": {$ne: true},
                "drafts": {$ne: true},
                "privated": {$ne: true}
            }).count(function (err, result) {
                if (err) {
                    reject();
                }
                data.type2 = result;
                resolve()
            });
        });
        let promise3 = new Promise((resolve, reject) => {
            dbase.collection("blogs").find({
                "author": obj.author,
                "type": '3',
                "deleted": {$ne: true},
                "drafts": {$ne: true},
                "privated": {$ne: true}
            }).count(function (err, result) {
                if (err) {
                    reject();
                }
                data.type3 = result;
                resolve()
            });
        });
        Promise.all([promise1, promise2, promise3]).then(function () {
            callback(null, data);//成功！返回查询的用户信息
            db.close();

        });

    });
};

//读取最新博客信息
Blog.prototype.getNew = function (obj, callback) {

    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        //读取 myblog 集合
        dbase.collection("blogs").find({
            'author': obj.author,
            "deleted": {$ne: true},
            "drafts": {$ne: true},
            "privated": {$ne: true}
        }).sort({"_id": -1}).limit(5).toArray(function (err, data) {
            if (err) {
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            callback(null, data);//成功！返回查询的用户信息
            db.close();
        });
    });

};

//删除（返回回收站）
Blog.prototype.delete = function (blogId, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 myblog 集合
        let dbase = db.db("myblog");
        let id = Number(blogId);
        try {
            dbase.collection("blogs").findOneAndUpdate(
                {id: id},
                {$set: {deleted: true}},
                {returnNewDocument: true},
                function (err, result) {
                    if (err) {
                        db.close();
                        return callback(err);//失败！返回 err 信息
                    }
                    callback(null, result);//成功！返回查询的用户信息
                    db.close();
                }
            );

        }
        catch (e) {
            db.close();
            return callback(err);//失败！返回 err 信息
        }

    });

};

//彻底删除
Blog.prototype.deepDelete = function (blogId, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 myblog 集合
        let dbase = db.db("myblog");
        let id = Number(blogId);
        try {
            dbase.collection("blogs").deleteOne(
                {id: id},
                function (err, result) {
                    if (err) {
                        db.close();
                        return callback(err);//失败！返回 err 信息
                    }
                    callback(null, result);//成功！返回查询的用户信息
                    db.close();
                }
            );


        }
        catch (e) {
            db.close();
            return callback(err);//失败！返回 err 信息
        }

    });

};

//读取博客状态信息
Blog.prototype.getStatus = function (obj, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已连接!");
        //读取 myblog 集合
        let dbase = db.db("myblog");
        try {
            //读取 myblog 集合
            dbase.collection("blogs").find({author: obj.author}).toArray(function (err, data) {
                if (err) {
                    db.close();
                    return callback(err);//错误，返回 err 信息
                }
                let obj = {};

                //私密的
                let privateArr = data.filter(function (e) {
                    if (e.privated && !e.deleted && !e.drafts) return e;
                });
                obj.privated = privateArr.length;
                //草稿箱的
                let draftsArr = data.filter(function (e) {
                    if (e.drafts) return e;
                });
                obj.drafts = draftsArr.length;
                //回收站的
                let trashArr = data.filter(function (e) {
                    if (e.deleted) return e;
                });
                obj.trash = trashArr.length;

                obj.published = data.length - obj.privated - obj.drafts - obj.trash;
                obj.total = data.length - obj.trash;

                callback(null, obj);//成功！返回查询的用户信息
                db.close();
            });

        }
        catch (e) {
            db.close();
            return callback(err);//失败！返回 err 信息
        }

    });

};

//添加PV数据
Blog.prototype.addPV = function (id, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //读取 myblog 集合
        let dbase = db.db("myblog");
        dbase.collection("blogs").findOneAndUpdate(
            {id: Number(id)},
            {
                $inc: {"PV": 1},
            },
            {returnNewDocument: true},
            function (err, result) {
                if (err) {
                    db.close();
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, result);//成功！返回查询的用户信息
                db.close();
            }
        );

    });
};

//置顶文章
Blog.prototype.toTop = function (obj, callback) {

    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err
        } else {
            console.log("数据库已连接!");
        }
        //读取 users 集合
        let dbase = db.db("myblog");

        if (Number(obj.toTop)) {
            //置顶
            dbase.collection("ID").find({}).toArray(function (err, ID) {
                let toTopId = Number(ID[2].toTopId);
                dbase.collection("blogs").findOneAndUpdate(
                    {id: Number(obj.id)},
                    {
                        $set: {"toTop": toTopId},
                    },
                    {returnNewDocument: true},
                    function (err, result) {
                        if (err) {
                            db.close();
                            return callback(err);//失败！返回 err 信息
                        }
                        //更新配置
                        dbase.collection("ID").update({id: 3}, {
                            "id": 3,
                            "toTopId": ++toTopId,
                            "des": "﻿作为记录当前置顶数值的参照物"
                        });
                        callback(null, result);//成功信息！
                        db.close();

                    }
                );
            });
        } else {
            //取消置顶
            try {
                dbase.collection("blogs").findOneAndUpdate(
                    {id: Number(obj.id)},
                    {
                        $set: {"toTop": 0},
                    },
                    {returnNewDocument: true},
                    function (err, result) {
                        if (err) {
                            db.close();
                            return callback(err);//失败！返回 err 信息
                        }
                        //更新配置
                        callback(null, result);//成功信息！
                        db.close();

                    }
                );
            }
            catch (e) {
                db.close();
                return callback(err);//失败！返回 err 信息
            }
        }


    });

};


