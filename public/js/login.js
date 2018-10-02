/**
 *
 * @author 付颖志
 * @create 2018-08-10 下午5:54
 **/

$(document).ready(function () {

    // $('.submitBtn').click(function () {
    //     $(this).val('Loading...').animate({width: '100px'}, 1000, function () {
    //         $('.main').slideUp(300);
    //         setTimeout(function () {
    //             window.location.href = '/';
    //         }, 1000);
    //     });
    // });

    class LoginManager {
        constructor() {
            this.data = {}
        }

        initial() {

            //切换模块
            $('.toRegister').click(function () {
                $('.wrapper').addClass('on');
                $('.form-group input').val('');
            });
            $('.toLogin').click(function () {
                $('.wrapper').removeClass('on');
                $('.itform-groupem input').val('');
            });

            //注册
            $('.registerBtn').click(function () {
                let user = $('#r-user').val().trim();
                let p1 = $('#r-p1').val().trim();
                let p2 = $('#r-p2').val().trim();
                if (user == '') {
                    showErrorMsg('请输入用户名');
                    return;
                } else if (p1 == '') {
                    showErrorMsg('请输入密码');
                    return;
                } else if (p2 == '') {
                    showErrorMsg('请输入确认密码');
                    return;
                } else if (p1 != p2) {
                    showErrorMsg('两次输入的密码不一致');
                    return;
                }

                ajaxData('post', '/reg', {
                    name: user,
                    password1: p1,
                    password2: p2
                }).then(function (res) {
                    if (res.success) {
                        swal({
                            title: "Good job!",
                            text: "注册成功！",
                            icon: "success",
                            button: "去登陆",
                        }).then((value) => {
                            $('.toLogin').click();
                        });
                    } else {
                        showErrorMsg(res.error);
                    }
                }, function (err) {
                    console.log(err)
                });

            });

            // 登录
            $('.loginBtn').click(function () {
                let user = $('#l-user').val().trim();
                let password = $('#l-p').val().trim();
                if (user == '') {
                    showErrorMsg('请输入用户名');
                    $('#l-user').focus();
                    return;
                } else if (password == '') {
                    showErrorMsg('请输入密码');
                    $('#l-p').focus();
                    return;
                }
                ajaxData('post', '/login', {
                    name: user,
                    password: password,
                }).then(function (res) {
                    if (res.success) {
                        sessionStorage.setItem('user', JSON.stringify(res.data));
                        // swal({
                        //     title: "Good job!",
                        //     text: "登录成功！2s后自动跳转",
                        //     icon: "success",
                        //     button: "去首页",
                        //     // buttons: false,
                        //     timer: 2000,
                        // }).then((value) => {
                        $('.loginBtn').val('Loading...').animate({width: '100px'}, 1000, function () {
                            $('.main').slideUp(300);
                            setTimeout(function () {
                                window.location.href = '/';
                            }, 1000);
                        });
                        // });
                    } else {
                        showErrorMsg(res.error);
                        if (res.error.indexOf('用户不存在') != -1) {
                            $('#l-user').focus();
                        } else if (res.error.indexOf('密码错误') != -1) {
                            $('#l-p').focus();
                        }
                    }
                }, function (err) {
                    console.log(err)
                });
            });

        }
    }

    let manager = new LoginManager();
    manager.initial();


});
