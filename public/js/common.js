// import $ from 'jquery';

function ajaxData(type, url, data, beforeSendFn) {
    return new Promise(function (resole, reject) {
        $.ajax({
            url: url,
            type: type,
            data: data,
            // contentType: "application/x-www-form-urlencoded",//发送给服务器的数据格式
            dataType: 'json',
            beforeSend: function(request) {
                if(typeof beforeSendFn == 'function'){
                    beforeSendFn(request);
                }
            },
            success: resole,
            error: reject
        })
    });
}
function ajaxDataStringify(url, data, beforeSendFn) {
    return new Promise(function (resole, reject) {
        $.ajax({
            url: url,
            type: 'post',
            data: JSON.stringify(data),
            contentType: "application/json",
            // headers:{
            //     'Content-Type': "application/json"
            // },
            beforeSend: function(request) {
                if(typeof beforeSendFn == 'function'){
                    beforeSendFn(request);
                }
            },
            success: resole,
            error: reject
        })
    });
}
function ajaxDataJsonp(url, data, beforeSendFn) {
    return new Promise(function (resole, reject) {
        $.ajax({
            url: url,
            type: 'get',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            dataType: 'jsonp',//服务器返回的数据格式
            beforeSend: function(request) {
                if(typeof beforeSendFn == 'function'){
                    beforeSendFn(request);
                }
            },
            success: resole,
            error: reject
        })
    });
}

//错误信息弹窗
function showErrorMsg(err) {
    $('body').append('<div class="errorTip">' + err + '</div>').show();
    // $('.errorTip').animate({top: '100px', opacity: 1}, 500);
    setTimeout(function () {
        $('.errorTip').addClass('hide0');
    }, 800);
    document.getElementsByClassName('errorTip')[0].addEventListener('transitionend', function () {
        $('.errorTip').remove();
    });
}

function bindPaginationFn(manage) {
    $('.firstPage').unbind().click(function () {
        let currentPage = manage.data.currentPage;
        if(currentPage != 1){
            manage.getMemberList({page: 1});
        }
    });
    $('.prev').unbind().click(function () {
        let currentPage = manage.data.currentPage;
        if(currentPage > 1){
            manage.getMemberList({page: --currentPage});
        }

    });
    $('.next').unbind().click(function () {
        let currentPage = manage.data.currentPage;
        if(currentPage < manage.data.totalPage){
            manage.getMemberList({page: ++currentPage});
        }
    });
    $('.lastPage').unbind().click(function () {
        let currentPage = manage.data.currentPage;
        if(currentPage != manage.data.totalPage){
            manage.getMemberList({page: manage.data.totalPage});
        }
    });

    /*跳转到指定页*/
    $('.switchPage').unbind().click(function () {
        let page = $('.pageInput').val().trim();
        if(page == manage.data.currentPage)return;
        if(page <= manage.data.totalPage && page >= 1){
            manage.getMemberList({page: page});
        }
    });
    $('.pageInput').keyup(function (event) {
        let e = event || window.event;
        if(e.keyCode == 13){
            let page = $('.pageInput').val().trim();
            if(page == manage.data.currentPage)return;
            if(page <= manage.data.totalPage && page >= 1){
                manage.getMemberList({page: page});
            }
        }
    })


}

let loadPageFn = function (url) {
    $(".crmContent").load(url, function () {
        console.log(`${url} is loaded`);
        history.replaceState({name: url}, 'model page', url.split('.')[1]);
    });
};

// export default {
//     ajaxData: ajaxData,
//     ajaxDataJsonp: ajaxDataJsonp,
//     ajaxDataStringify: ajaxDataStringify,
//     bindPaginationFn: bindPaginationFn,
//     showErrorMsg: showErrorMsg,
//     loadPageFn,
// }




