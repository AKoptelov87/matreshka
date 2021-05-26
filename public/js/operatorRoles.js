$(function () {
    renderSavedPacks();
    // кнопка получения ролей
    $('#getRole').click(() => {
        let userName = $("#userName").val();
        if (userName === "") {
            alert("Не задано имя оператора");
            return
        }
        let reqParams = {
            "url": `http://srv3-amain-p.net.billing.ru:47131/ps/acc/api/role?short_output=true&branch_flag=1&user=${userName}`,
            "method": "GET",
            "headers": {
                "authorization": "Basic QWRtaW46MTExMQ=="
            }
        };
        sendRequestFromProxy(reqParams).then((result) => {
            result = result[0].roles || result;
            printResult(JSON.stringify(result, null, 2));
        })
    });

    // кнопка выдачи ролей
    $('#grantRole').click(() => {
        let userName = $("#userName").val(),
            roleToGrant = getInputData();

        Promise.all(roleToGrant.map(role => {
                //Проверяем наличие роли у пользователя
                return sendRequestFromProxy({
                    "url": `http://srv3-amain-p.net.billing.ru:47131/ps/acc/api/users/checkroles?login_list=${userName}&branch_flag=1&role_name_list=${role}`,
                    "method": "GET",
                    "headers": {
                        "authorization": "Basic QWRtaW46MTExMQ=="
                    }
                }).then(isExistResp => {
                    role = {
                        role_name: role,
                    };
                    // если есть свойство role - записываем в result
                    if (isExistResp[0] && isExistResp[0].roles) {
                        role.result = 'Роль уже выдана';
                        return role
                    } else {
                        //если нет то выдаем
                        return sendRequestFromProxy({
                            "url": `http://srv3-amain-p.net.billing.ru:47131/ps/acc/api/users/login/${userName}/role/?needInvalidate=false`,
                            "method": "POST",
                            "body": `{ "role_name_list": [{"role_name": "${role.role_name}"}] }`,
                            "headers": {
                                "content-type": "application/json",
                                "authorization": "Basic QWRtaW46MTExMQ=="
                            }
                        })
                    }
                }).then(grantResp => {
                    if (!role.result) {
                        console.log(grantResp);
                        role.result = grantResp;
                    }
                    return role;
                })
            })
        ).then(result => {
            printResult(JSON.stringify(result, null, 2));
        })
    });

    // кнопка проверки ролей
    $('#checkRole').click(() => {
        let userName = $("#userName").val(),
            roleToCheck = getInputData();
        Promise.all(roleToCheck.map(role => {
                //Проверяем наличие роли у пользователя
                return sendRequestFromProxy({
                    "url": `http://srv3-amain-p.net.billing.ru:47131/ps/acc/api/users/checkroles?login_list=${userName}&branch_flag=1&role_name_list=${role}`,
                    "method": "GET",
                    "headers": {
                        "authorization": "Basic QWRtaW46MTExMQ=="
                    }
                }).then(isExistResp => {
                    console.log(isExistResp);
                    role = {
                        role_name: role,
                        result: isExistResp || "error"
                    };
                    // // если есть свойство role - записываем в result
                    // if (isExistResp[0] && isExistResp[0].roles) {
                    //     role.result = isExistResp;
                    // }else{
                    //     role.result = 'Роль не выдана';
                    // }
                    return role
                })
            })
        ).then(result => {
            printResult(JSON.stringify(result, null, 2));
        })
    });


    //кнопкa сохранения паков
    $('#saveFile').click(() => {
        try {
            if ($("#fileName").val() === "") {
                throw "Не задано имя шаблона"
            }
            let source = getInputData(),
                name = $("#fileName").val().trim();
            $.ajax({
                type: "POST",
                url: "/fileAction/saveFile?type=role_pack",
                data: `{ "name": "${name}", "source": "${source}" }`,
                contentType: 'application/json'
            }).done(() => {
                renderSavedPacks();
                alert("Ok");
            })
        } catch (e) {
            alert("Не удалось сохранить файл \n" + e);
        }
    });

    //кнопки загрузки паков
    $('.pack-list').on('click', 'li.pack-list__item', (event) => {
        if (event.target.nodeName != 'LI') {
            return false;
        }
        var name = $(event.target).text().trim();

        $.get(`/fileAction/readFile?type=role_pack&name=${name}`)
            .done((response) => {
                // $('.main-form__textarea').val(JSON.stringify(response, null, 2));
                $('.main-form__textarea').val(response.replace(/,/g, ',\n'));
                $('#fileName').val('');
            })
            .fail(() => {
                alert("Не удалось загрузить файл")
            });
    });

    //кнопки удаления паков
    $('.pack-list').on('click', 'img.pack-list__remove', (event) => {
        if (confirm('Подтвердите удаление')) {
            var target = $(event.target).parent();
            var name = target.text().trim();

            $.get(`/fileAction/deleteFile?type=role_pack&name=${name}`)
                .done(() => {
                    target.remove();
                })
                .fail(() => {
                    alert("Не удалось удалить файл")
                });
        }
    });
});

function getInputData() {

    //проверим имя оператора
    if ($("#userName").val() === "") {
        throw "Не задано имя оператора"
    }
    let text = $('.main-form__textarea').val().split('---')[0];
    if (IsJsonString(text)) {
        return IsJsonString(text)
    }
    return text.replace(/\n|\r/g, '').trim().split(/\s*[;,]\s*/)
}

function IsJsonString(str) {
    try {
        let data = JSON.parse(str);
        if (Array.isArray(data) && data[0].role_name) {
            return data.map(role => role.role_name)
        }
    } catch (e) {
        return false;
    }
}

function printResult(text) {
    console.log(text);
    var query = $('.main-form__textarea').val().split('---')[0].trim();
    $('.main-form__textarea').val(`${query}\n\n---\nРезультат:\n${text}`);
}

function renderSavedPacks() {
    var listUL = $('.pack-list');
    $.get('/fileAction/getLists?type=role_pack')
        .done((packs) => {
            listUL.empty();
            packs.forEach(pack => {
                listUL.append(`<li class="pack-list__item">${pack}<img class="pack-list__remove" src="../img/remove.png"> </li>`);
            })
        });
}

function sendRequestFromProxy(body) {
    $('#wait').toggle();
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: "/proxy",
            data: JSON.stringify(body),
            contentType: 'application/json'
        }).done(function (response) {
            $('#wait').toggle();
            resolve(response);
        }).fail(function (response) {
            $('#wait').toggle();
            resolve(response.responseText);
        })
    })
}

