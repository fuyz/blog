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
    checkUser: function (req) {
        let user = req.session.user;
        if(user == undefined){
            return false
        }else {
            return true;
        }
    }

};

