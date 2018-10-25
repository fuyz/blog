/**
 *
 * @author 付颖志
 * @create 2018-09-17 下午5:24
 **/
let mongodb = require('./db');
//打开数据库
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017";

let log4js = require('log4js');
let logger = log4js.getLogger('blog.js');

function Comment(obj) {
    this.articleId = obj.articleId; //被评论文章id
    this.content = obj.content; //评论内容
    this.userId = obj.userId;   //评论者id
    this.userName = obj.userName;   //作者
    this.createTime = obj.createTime;   //评论时间
    this.replyList = obj.replyList;   //回复列表（按盖楼顺序）
    this.isDelete = obj.isDelete;   //是否已经删除

}

module.exports = Comment;

//写评论
Comment.prototype.writeComment = function (callback) {

    let _this = this;
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            logger.error(err);
            return;
        } else {
            logger.info("数据库已连接!");
        }
        //读取  集合
        let dbase = db.db("myblog");
        dbase.collection("ID").find({}).toArray(function (err, ID) {
            let commentId = Number(ID[3].commentId);
            //要存入数据库的用户文档
            let commentObj = {
                commentId: commentId,
                articleId: _this.articleId,
                content: _this.content,
                userId: _this.userId,
                userName: _this.userName,
                createTime: _this.createTime,
                replyList: _this.replyList,
                isDelete: _this.isDelete,
            };

            dbase.collection("comments").insertOne(commentObj, function (err, result) {
                if (err) {
                    logger.error(err);
                    db.close();
                    return callback(err);//错误，返回 err 信息
                }
                dbase.collection("ID").findOneAndUpdate(
                    {id: 4},
                    {
                        $set: {
                            commentId: ++commentId
                        }
                    },
                    {returnNewDocument: true}
                );
                callback(null, result);//成功！err 为 null，并返回存储后的用户文档

                //设置更新文章评论数
                Comment.prototype.setCommentLength({articleId: _this.articleId});

            });
        });

    });

};

//读取所有博客信息
Comment.prototype.getComments = function (obj, callback) {
    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            logger.error(err);
            return;
        } else {
            logger.info("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        //读取 myblog 集合
        dbase.collection("comments").find({
            "articleId": obj.articleId,
            "isDelete": {$ne: 1},
        }).sort({"_id": -1}).toArray(function (err, data) {
            if (err) {
                logger.error(err);
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            callback(null, data);//成功！返回查询的用户信息
            db.close();

        });
    });

};
//
Comment.prototype.getOneComment = function (obj, callback) {
    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            logger.error(err);
            return;
        } else {
            logger.info("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        //读取 myblog 集合
        dbase.collection("comments").find({commentId: obj.commentId}).toArray(function (err, data) {
            if (err) {
                logger.error(err);
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            callback(null, data);//成功！返回查询的用户信息

        });
    });

};

//设置评论总数到文章信息里
Comment.prototype.setCommentLength = function (obj, callback) {
    //数据库客户端连接
    MongoClient.connect(url, function (err, db) {
        if (err) {
            logger.error(err);
            return;
        } else {
            logger.info("数据库已连接!");
        }
        //连接数据库
        let dbase = db.db("myblog");
        //读取 myblog 集合
        dbase.collection("comments").find({
            articleId: obj.articleId,
            isDelete: {$ne: 1}
        }).count(function (err, result) {
            if (err) {
                logger.error(err);
                db.close();
                return callback(err);//错误，返回 err 信息
            }
            dbase.collection("blogs").findOneAndUpdate(
                {id: Number(obj.articleId)},
                {
                    $set: {
                        commentCount: result,
                    }
                },
                {returnNewDocument: true},
                function (err, result) {
                    if (err) {
                        logger.error(err);
                        db.close();
                        return callback(err);//失败！返回 err 信息
                    }
                    // callback(null, result);//成功！返回查询的用户信息
                    db.close();
                }
            );
            // callback(null, result);//成功！返回查询的用户信息
            // db.close();

        });
        
    });

};

//删除评论
Comment.prototype.delete = function (obj, callback) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            logger.error(err);
            return;
        }
        logger.info("数据库已连接!");
        //读取 myblog 集合
        let dbase = db.db("myblog");
        try {
            dbase.collection("comments").findOneAndUpdate(
                {commentId: Number(obj.commentId)},
                {$set: {isDelete: 1}},
                {returnNewDocument: true},
                function (err, result) {
                    if (err) {
                        logger.error(err);
                        db.close();
                        return callback(err);//失败！返回 err 信息
                    }
                    callback(null, result);//成功！返回查询的用户信息

                    //设置更新文章评论数
                    Comment.prototype.setCommentLength({articleId: obj.articleId});
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



