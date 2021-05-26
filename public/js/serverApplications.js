/**
 * Created by Anton.Koptelov on 15.03.2018.
 */

$(function () {
    // при загрузке страницы надо получить свободное место и статус сервисов
    // $('td#status').click();
    var statButtons = $('td#status');
    var timeout = 0;
    for (var i = 0; i < statButtons.length; i++) {
        setTimeout((function (N) {
            return function () {
                $(statButtons[N]).click()
            }
        })(i), timeout);
        timeout += 100;
    }


    $('button#getSpace').click();
    // window.setInterval(function () {
    //   getStatus('apache_sbms');
    // }, 10000);
});


function getStatus(serv, app) {
    if (!$(`#${app} #wait`).length > 0) {
        $(`#${app} #status`).html('<div class="loaderMini"></div>');
    }
    $.get(`/serverAction/${serv}/${app}`, function (data) {
        if (data) {
            $(`#${app} #status`).html('<span class="badge badge-success">True</span>')
        } else {
            $(`#${app} #status`).html('<span class="badge badge-danger">False</span>');
        }
    })
}

function getSpace(serv) {
    $('#wait').toggle();
    $.get(`serverAction/${serv}/space`, function (data) {
        $('#console').val(data);
        $('#wait').toggle();
        var u02 = data.match(/(\d+%)\s+\/u02/i);
        if (u02 && u02[1]) {
            $('#space').text(u02[1]);
        }
    })
}

function sendGetRequest(path) {
    $('#wait').toggle();
    $.get(path, function (data) {
        $('#console').val(data);
        $('#wait').toggle();
    })
}
