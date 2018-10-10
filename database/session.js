/**
 *
 * @author 付颖志
 * @create 2018-09-19 下午6:34
 **/
module.exports = {

    //获取用户信息
    getUser: function (req) {
        return req.session.user;
    },

    //检查user是否还存在
    checkUser: function (req, res) {
        let user = req.session.user;
        if (user == undefined) {
            // return false
            res.redirect('/login');

        } else {
            return true;
        }
    },

    //检查session是否过期
    checkSession: function (req, res, next) {
        console.log('------------------------hi, I have checked session!!!');
        let url = req.originalUrl;
        if (/manage/.test(url)) {
            if (!checkUser(req)) {
                // res.render('error', {title: '连接超时'});
                res.redirect('/login');
            }
        }
        // next();
    }
// app.use(checkSession);


};

