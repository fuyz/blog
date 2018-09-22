/*
* 其中 db 是数据库的名称，host 是数据库的地址，port是数据库的端口号，cookieSecret 用于 Cookie 加密与数据库无关，我们留作后用。
* */
module.exports = {
    cookieSecret: 'myblog',
    db: 'myblog',
    host: 'localhost',
    port: 27017
};