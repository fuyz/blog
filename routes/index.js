let Blog = require('../models/blog.js');
let sessionConfig = require('../database/session');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index', {title: '首页'});
    });
    app.get('/login', function (req, res) {
        res.render('login', {title: '登录注册'});
    });
    app.get('/logout', function (req, res) {
        req.session.destroy(function(err) {
            if(err){
                res.json({success: false, error:'退出登录失败', data: null, status: 200});
                return;
            }
            // req.session.loginUser = null;
            // res.clearCookie('skey');
            res.render('login', {title: '登录注册'});

        });
    });
    app.get('/error', function (req, res) {
        res.render('error', {title: '连接超时'});
    });
    app.get('/manage/users', function (req, res) {
        sessionConfig.checkUser(req, res);
        res.render('users', {title: 'users'});
    });
    app.get('/manage/blog/:blogId', function (req, res, next) {
        sessionConfig.checkUser(req, res);

        if (req.params.blogId == 'index') {
            res.render('blog/blog', {title: '写博客', blogObj: {}});
        } else {
            Blog.prototype.getOne(req.params.blogId, function (err, blog) {
                if (err) {
                    res.json({success: false, status: 200, error: err, data: null});
                    return;
                }
                //用户不存在
                if (blog == null) {
                    res.json({success: false, status: 200, error: '博客不存在!', data: null});
                    return;
                }
                res.render('blog/blog', {title: '编辑博客', blogObj: blog});

            });
        }

    });
    app.get('/manage/blogList', function (req, res, next) {
        sessionConfig.checkUser(req, res);

        res.render('blog/blogList', {title: '博客列表'});
    });
    app.get('/common/blogDetail/:blogId', function (req, res) {
        console.log('url参数对象 :', req.params);
        Blog.prototype.getOne(req.params.blogId, function (err, blog) {
            if (err) {
                res.json({success: false, status: 200, error: err, data: null});
                return;
            }
            //用户不存在
            if (blog == null) {
                res.json({success: false, status: 200, error: '博客不存在!', data: null});
                return;
            }
            res.render('blog/blogView', {title: '博客详情', blogObj: blog});

        });
    });

};
