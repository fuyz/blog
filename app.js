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
    User = require('./models/user.js');

//数据库设置
let settings = require('./database/setting');
// /第三方中间件
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
//session处理封装函数
let sessionConfig = require('./database/session');


let indexRouter = require('./routes/index');
let loginRouter = require('./routes/login');

let app = express();

//实现了将会话信息存储到mongoldb中
app.use(session({
    secret: settings.cookieSecret, //防止篡改 cookie
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24},//30 days
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));

// view engine setup
/*在 Express 中使用模板引擎需要在应用中进行如下设置才能让 Express 渲染模板文件：设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录。
*/
app.set('views', path.join(__dirname, 'views'));
//设置视图模板引擎为 ejs。
// app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(flash());
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

/*路由控制器。*/
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.get('/logout', function (req, res) {
    res.render('login', {title: '登录注册'});
});
app.get('/error', function (req, res) {
    res.render('error', {title: '连接超时'});
});

//登录
app.post('/login', function (req, res) {
    let name = req.body.name;
    let password = req.body.password;
    if(name == '' || name == null){
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
        if(user == null){
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
        console.log(user);
        if (err) {
            res.json({success: false, status: 200, error: err, data: null});
            return;
        }
        if (user) {
            res.json({success: false, status: 200, error: '用户已存在!', data: null});
            return;
            // res.status(500).send({ error: 'something blew up' });
            // return res.redirect('/login');//返回注册页
        }
        //如果不存在则新增用户
        newUser.save(function (err, user) {
            if (err) {
                res.json({success: false, status: 200, error: err, data: null});
                return;
                // return res.redirect('/login');//注册失败返回主册页
            }
            console.log(user);
            req.session.user = user;//用户信息存入 session
            res.json({success: true, status: 200, data: null});

            // res.redirect('/');//注册成功后返回主页
        });
    });
});


app.get('/blog', function (req, res) {
    res.render('blog', {title: '博客'});
});
// 发博客
app.post('/post', function (req, res) {
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




