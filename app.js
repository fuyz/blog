let createError = require('http-errors');
let express = require('express'); //生成一个express实例 app。
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
// flash 是一个在 session 中用于存储信息的特定区域。信息写入 flash ，下一次显示完毕后即被清除。典型的应用是结合重定向的功能，确保信息是提供给下一个被渲染的页面。
let flash = require('connect-flash');

//解析请求的body中的内容[必须]
let bodyParser = require('body-parser');

// 引入 crypto 模块和 user.js 用户模型文件，crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码。
let crypto = require('crypto'),
    User = require('./models/user.js'),
    Blog = require('./models/blog.js');

//数据库设置
let settings = require('./database/setting');
// /第三方中间件
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
//session处理封装函数
let sessionConfig = require('./database/session');

// let indexRouter = require('./routes/index');
// let loginRouter = require('./routes/login');

let app = express();
let routes = require('./routes/index');

//实现了将会话信息存储到mongoldb中
app.use(session({
    name: 'skey',
    secret: settings.cookieSecret, //防止篡改 cookie
    key: settings.db,//cookie name
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60},//30 days
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));
// view engine setup
//在 Express 中使用模板引擎需要在应用中进行如下设置才能让 Express 渲染模板文件：设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录。
app.set('views', path.join(__dirname, 'views'));
//设置视图模板引擎为 ejs。
// app.set('view engine', 'jade');
app.set('view engine', 'ejs');
//注册ejs模板为html页。原来以.ejs为后缀的模板页，现在的后缀名可以是.html了, 设置视图模板的默认后缀名为.html
// app.engine('.html', require('ejs').__express);
// app.set('view engine', 'html');
// app.use(flash());
//设置/public/favicon.ico为favicon图标。
// app.use(favicon(__dirname + '/public/favicon.ico'))


// 加载日志中间件。
app.use(logger('dev'));
// 加载解析json的中间件。
app.use(bodyParser.json());
// 加载解析urlencoded请求体的中间件。
app.use(bodyParser.urlencoded({extended: false}));
// 加载解析cookie的中间件。
app.use(cookieParser());
// 设置public文件夹为存放静态文件的目录。
/* 设置了静态文件目录为 public 文件夹，所以在index.ejs代码中的: href='/stylesheets/style.css' 就相当于 href='public/stylesheets/style.css' 。*/
app.use(express.static(path.join(__dirname, 'public')));


// app.all('/*', function (req, res, next) {
//     console.log('------------------------hi, I have checked session!!!');
//     let url = req.originalUrl;
//     if (!/login/.test(url) && !/logout/.test(url) && !/error/.test(url)) {
//         if (!sessionConfig.checkUser(req)) {
//             res.render('error', {title: '连接超时'});
//         }
//     }
// });

//路由控制器
routes(app);

//登录
app.post('/login', function (req, res) {
    let name = req.body.name;
    let password = req.body.password;
    if (name == '' || name == null) {
        res.json({success: false, status: 200, error: '用户名为空', data: null});
        return;
    }
    //检查用户名是否已经存在
    User.prototype.get(name, function (err, user) {

        console.log(user);
        console.log(req.session)
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        //用户不存在
        if (user == null) {
            res.json({success: false, status: 200, error: '用户不存在!', data: null});
            return;
        }
        //检查密码是否一致
        if (user.password != password) {
            res.json({success: false, status: 200, error: '密码错误', data: null});
            return;
        }
        //用户名密码都匹配后，将用户信息存入 session
        req.session.user = user;
        res.json({success: true, status: 200, data: user});
        // res.redirect('/');
        // res.render('index', {title: '主页1'});
    });
});
//注册
app.post('/reg', function (req, res) {
    let name = req.body.name,
        password = req.body.password1,
        password_re = req.body.password2;
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        // req.flash('error', '两次输入的密码不一致!');
        res.json({success: false, status: 200, error: '两次输入的密码不一致!', data: null});
        return;
    }
    //生成密码的 md5 值
    // let md5 = crypto.createHash('md5');
    // password = md5.update(req.body.password).digest('hex');
    let newUser = new User({
        name: name,
        password: password,
        // email: req.body.email
    });
    //检查用户名是否已经存在
    newUser.get(newUser.name, function (err, user) {
        console.log('注册前的查询：user: ' + user);
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        if (user) {
            res.json({success: false, status: 200, error: '用户已存在!', data: null});
            return;
        }
        //如果不存在则新增用户
        newUser.save(function (err, user) {
            if (err) {
                res.json({success: false, status: 200, error: err, data: null});
                return;
            }
            console.log(user);
            req.session.user = user;//用户信息存入 session
            res.json({success: true, status: 200, data: null});

            // res.redirect('/');//注册成功后返回主页
        });
    });
});
//获取用户
app.post('/getUsers', function (req, res) {
    /*
    currentIndex: 0
    currentPage: 1
    hasNext: true
    hasPrev: false
    nextPage: 2
    pageData: [{id: 36, name: "广告投放系统", global: false, uri: "/echannel", viewLocation: "/web/advertising",…},…]
    pageSize: 10
    prevPage: 1
    totalPage: 2
    totalSize:
    */
    // if (currentPage == '' || currentPage == null || currentPage == undefined) {
    // res.json({success: false, status: 200, error: '用户名为空', data: null});
    // return;
    // }
    User.prototype.getAll({}, function (err, userArr) {

        let obj = {};
        obj.currentIndex = req.body.currentIndex || 1;
        obj.currentPage = Number(req.body.currentPage) || 1;

        obj.pagesize = req.body.pageSize | 10;
        obj.totalSize = userArr.length;
        obj.totalPage = Math.ceil(obj.totalSize / obj.pagesize);

        if (obj.currentPage > 1) {
            obj.prevPage = obj.currentPage - 1;
            obj.hasPrev = true;
        } else {
            obj.hasPrev = false;
        }
        if (obj.currentPage < obj.totalPage) {
            obj.nextPage = obj.currentPage + 1;
            obj.hasNext = true;
        } else {
            obj.hasNext = false;
        }

        if (obj.totalPage == 1) {
            obj.pageData = userArr;
        } else if (obj.currentPage == obj.totalPage) {
            obj.pageData = userArr.slice((obj.currentPage - 1) * 10);
        } else {
            obj.pageData = userArr.slice((obj.currentPage - 1) * 10, obj.currentPage * 10);
        }

        // if(userArr.length / pageSize)
        return res.json({success: true, status: 200, data: obj});

    })
});
app.post('/deleteUsers', function (req, res) {
    User.prototype.delete(req.body.id, function (err, result) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        if (result.deletedCount == 1) {
            res.json({success: true, status: 200, data: null});
        } else {
            res.json({success: false, status: 200, error: '删除失败', data: null});
        }

    })
});
app.post('/updateUsers', function (req, res) {
    User.prototype.update(req.body, function (err, result) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        if (result.ok == 1) {
            res.json({success: true, status: 200, data: result.value});
        } else {
            res.json({success: false, status: 200, error: '修改失败', data: null});
        }

    })
});

// 发博客
app.post('/blog', function (req, res) {
    let obj = req.body;
    if (obj.title == '') {
        res.json({success: false, status: 200, error: '请输入文章标题!', data: null});
        return;
    }
    if (obj.content == '') {
        res.json({success: false, status: 200, error: '请输入文章内容!', data: null});
        return;
    }
    if (obj.type == 0) {
        res.json({success: false, status: 200, error: '请选择文章类型!', data: null});
        return;
    }

    let newBlog = new Blog({
        index: obj.id,
        title: obj.title, //博客标题
        content: obj.content, //博客内容
        author: obj.author, //作者
        createTime: obj.createTime,   //发表时间
        type: obj.type,
        tags: obj.tags,
        privated: obj.privated,
        drafts: obj.drafts

    });

    //新增加/修改博文
    newBlog.createOrModifyBlog(obj.id, function (err, blog) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }

        if (blog.ok == 1) {
            res.json({success: true, status: 200, data: '修改成功'});
        } else if (blog.result.ok == 1) {
            res.json({success: true, status: 200, data: {msg: '发布成功', blogId: blog.ops[0].id}});
        } else {
            res.json({success: false, status: 200, error: err, data: null});
        }

    });

});
//获取所有博客
app.post('/getBlogs', function (req, res) {
    /*
    currentIndex: 0
    currentPage: 1
    hasNext: true
    hasPrev: false
    nextPage: 2
    pageData: [{id: 36, name: "广告投放系统", global: false, uri: "/echannel", viewLocation: "/web/advertising",…},…]
    pageSize: 10
    prevPage: 1
    totalPage: 2
    totalSize:
    */
    // if (currentPage == '' || currentPage == null || currentPage == undefined) {
    // res.json({success: false, status: 200, error: '用户名为空', data: null});
    // return;
    // }
    let type = req.body.type;
    let time = req.body.time;
    let keyword = req.body.keyword;

    Blog.prototype.getAll({}, function (err, blogArr) {

        if (req.body.status == 'total') {
            blogArr = blogArr.filter(function (e) {
                if (e.deleted != true) return e
            });
        } else if (req.body.status == 'published') {
            blogArr = blogArr.filter(function (e) {
                if (e.deleted != true && e.drafts != true && e.privated != true) return e
            });
        } else if (req.body.status == 'deleted') {
            blogArr = blogArr.filter(function (e) {
                if (e.deleted == true) return e
            });
        } else if (req.body.status == 'drafts') {
            blogArr = blogArr.filter(function (e) {
                if (e.drafts == true) return e
            });
        } else if (req.body.status == 'privated') {
            blogArr = blogArr.filter(function (e) {
                if (e.privated == true && e.deleted != true && e.drafts != true) return e
            });
        }

        //类型筛选
        if (type != '') {
            blogArr = blogArr.filter(function (e) {
                if (e.type == req.body.type) return e
            });
        }
        //搜索筛选
        if (keyword != '') {
            blogArr = blogArr.filter(function (e) {
                if (e.title.indexOf(keyword) != -1) return e
            });
        }
        //时间筛选
        if (time != '') {
            blogArr = blogArr.filter(function (e) {
                if (new Date(1538187363727).getFullYear() == time) return e
            });
        }

        let obj = {};
        obj.currentIndex = req.body.currentIndex || 1;
        obj.currentPage = Number(req.body.currentPage) || 1;

        obj.pagesize = req.body.pageSize | 10;
        obj.totalSize = blogArr.length;
        obj.totalPage = Math.ceil(obj.totalSize / obj.pagesize);

        if (obj.currentPage > 1) {
            obj.prevPage = obj.currentPage - 1;
            obj.hasPrev = true;
        } else {
            obj.hasPrev = false;
        }
        if (obj.currentPage < obj.totalPage) {
            obj.nextPage = obj.currentPage + 1;
            obj.hasNext = true;
        } else {
            obj.hasNext = false;
        }

        if (obj.totalPage == 1) {
            obj.pageData = blogArr;
        } else if (obj.currentPage == obj.totalPage) {
            obj.pageData = blogArr.slice((obj.currentPage - 1) * 10);
        } else {
            obj.pageData = blogArr.slice((obj.currentPage - 1) * 10, obj.currentPage * 10);
        }

        // if(blogArr.length / pageSize)
        res.json({success: true, status: 200, data: obj});

    })
});
app.post('/viewBlog', function (req, res) {
    Blog.prototype.getOne(id, function (err, blog) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        //用户不存在
        if (blog == null) {
            res.json({success: false, status: 200, error: '博客不存在!', data: null});
            return;
        }
        res.json({success: true, status: 200, data: user});
    });
});
app.post('/deleteBlog', function (req, res) {
    Blog.prototype.delete(req.body.id, function (err, blog) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        //用户不存在
        if (blog == null) {
            res.json({success: false, status: 200, error: '博客不存在!', data: null});
            return;
        }
        res.json({success: true, status: 200, data: blog});
    });
});
app.post('/deepDeleteBlog', function (req, res) {
    Blog.prototype.deepDelete(req.body.id, function (err, blog) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        //用户不存在
        if (blog == null) {
            res.json({success: false, status: 200, error: '博客不存在!', data: null});
            return;
        }
        res.json({success: true, status: 200, data: '删除成功'});
    });
});
//获取博客状态
app.post('/getBlogStatus', function (req, res) {
    Blog.prototype.getStatus(function (err, blog) {
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        //用户不存在
        if (blog == null) {
            res.json({success: false, status: 200, error: '博客不存在!', data: null});
            return;
        }
        res.json({success: true, status: 200, data: blog});
    });
});
//获取最新博客
app.post('/getNewBlogs', function (req, res) {
    Blog.prototype.getNew({}, function (err, blogArr) {
        res.json({success: true, status: 200, data: blogArr});
    })
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
/*错误处理: 错误处理器，将错误信息渲染error模版并显示到浏览器中
定义错误处理中间件和定义其他中间件一样，除了需要 4 个参数，而不是 3 个，*/
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;




