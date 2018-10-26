let Blog = require('../models/blog.js');
let User = require('../models/user.js');
let sessionConfig = require('../database/session');

let log4js = require('log4js');
let logger = log4js.getLogger('blog.js');

module.exports = function (app) {
    app.get('/', function (req, res) {
        try {
            let userInfo = sessionConfig.getUser(req, res);
            res.render('index', {title: '首页-Blog', user: userInfo ? userInfo : {}});
        }catch (err){
            logger.error(err);
        }

    });
    app.get('/login', function (req, res) {
        res.render('login', {title: '登录注册-Blog'});
    });
    app.get('/logout', function (req, res) {
        try {
            req.session.destroy(function(err) {
                if(err){
                    logger.error(err);
                    res.json({success: false, error:'退出登录失败', data: null, status: 200});
                    return;
                }
                // req.session.loginUser = null;
                res.clearCookie('skey');
                res.render('login', {title: '登录注册-Blog'});

            });
        }catch (err){
            logger.error(err);
        }

    });
    app.get('/error', function (req, res) {
        res.render('error', {title: '连接超时'});
    });
    app.get('/manage/users', function (req, res) {
        let userInfo = sessionConfig.checkUser(req, res);
        res.render('users', {title: '用户管理-Blog', user: userInfo ? userInfo : {}});
    });
    app.get('/manage/blog/:blogId', function (req, res, next) {
        let userInfo = sessionConfig.checkUser(req, res);
        if (req.params.blogId == 'index') {
            res.render('blog/blog', {title: '写博客-Blog', blogObj: {}, user: userInfo ? userInfo : {}});
        } else {
            Blog.prototype.getOne(req.params.blogId, function (err, blog) {
                if (err) {
                    logger.error(err);
                    res.json({success: false, status: 200, error: err, data: null});
                    return;
                }
                //用户不存在
                if (blog == null) {
                    res.json({success: false, status: 200, error: '博客不存在!', data: null});
                    return;
                }
                res.render('blog/blog', {title: '编辑博客-Blog', blogObj: blog, user: userInfo ? userInfo : {}});

            });
        }

    });
    //博客管理
    app.get('/manage/blogList', function (req, res, next) {
        let userInfo = sessionConfig.checkUser(req, res);
        res.render('blog/m-blogList', {title: '博客管理-Blog', user: userInfo});

    });
    app.get('/common/blogDetail/:blogId', function (req, res) {
        logger.info('url参数对象 :', req.params);
        let userInfo = sessionConfig.getUser(req, res);
        //博客查询
        Blog.prototype.getOne(req.params.blogId, function (err, blog) {
            if (err) {
                logger.error(err);
                res.json({success: false, status: 200, error: err, data: null});
                return;
            }
            //用户不存在
            if (blog == null) {
                res.json({success: false, status: 200, error: '博客不存在!', data: null});
                return;
            }

            //查询作者信息
            User.prototype.get(blog.author, function (err, user) {
                if (err) {
                    logger.error(err);
                    res.json({success: false, status: 200, error: err, data: null});
                    return;
                }
                //用户不存在
                if (user == null) {
                    res.json({success: false, status: 200, error: '用户不存在!', data: null});
                    return;
                }

                res.render('blog/blogView', {title: blog.title+'-'+ blog.author/*'博客详情-Blog'*/, blogObj: blog, authorInfo: user, user: userInfo ? userInfo : {} });

            });

        });
    });
    //我的博客
    app.get('/common/u-blogList', function (req, res, next) {
        logger.info('url参数对象 :', req.query);
        let userInfo = sessionConfig.getUser(req, res);
        //查询作者信息
        User.prototype.get(req.query.author, function (err, user) {
            if (err) {
                logger.error(err);
                res.json({success: false, status: 200, error: err, data: null});
                return;
            }
            //用户不存在
            if (user == null) {
                res.json({success: false, status: 200, error: '用户不存在!', data: null});
                return;
            }

            res.render('blog/u-blogList', {title: '博客列表-Blog', authorInfo: user, user: userInfo ? userInfo : {} });

        });

    });


};
