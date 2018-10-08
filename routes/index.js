let express = require('express');
let router = express.Router();
//session处理封装函数
let sessionConfig = require('../database/session');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '首页'});
});

module.exports = router;
