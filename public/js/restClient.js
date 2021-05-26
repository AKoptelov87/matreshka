$(function () {
    let token;
    getToken();
    //кнопка обновить токен
    $('.refreshTokenButton').click(() => {
        getToken();
    });

    // Динамическое заполнение имени
    $('.container').on('change', '.nameField', function () {
        let nameText = $(this).val();
        $(this).closest(".request").find('.requestName').val(nameText);
    });

    /** кнопка "Выполнить" */
    $('.container').on('click', '#runButton', async function () {

        const runButton = $(this),
            formParams = collectParams($(`#requestForm-${runButton.attr("requestId")}`));

        setLoadingStatus(runButton);
        let result = await executeRequest({
            "url": `${formParams.URL}`,
            "method": `${formParams.requestType}`,
            "body": `${formParams.body}`,
            "headers": {
                "content-type": "application/json",
                "Accept": "application/json",
                "authToken": `${formParams.needToken ? token : ''}`,
                "Cookie": `x-ps-token=${formParams.needToken ? token : ''}`,
                "x-ps-user_attrs": ""
            }
        });

        $(`textarea[responseId='${formParams.id}']`).val(checkJson(result.body) ? JSON.stringify(result.body, null, 2) : result.body);
        setResultStatus(runButton, result.code == formParams.responseCode);
    });

    /** кнопка "новый запрос" */
    $('#addRequest').click(() => {
        $('#requestList').append(
            testString(Math.random().toString(36).substr(2, 9))
        );
    });

    /** кнопка "Запустить все" */
    $('#runAll').click(() => {
        $('#requestList #runButton').click();
    });

    /** кнопка "Удалить запрос" */
    $('#requestList').on('click', '.deleteRequestButton', function () {
        $(this).closest(".request").remove();
    });

    // ---- // functions \\ ----\\

    //получение токена
    function getToken() {
        const tokenField = $('#token input#tokenField'),
            formParams = collectParams($('#requestForm-ssoTokenParams')),
            //     $('#requestForm-ssoTokenParams').serializeArray().reduce(function (formElements, item) {
            //     formElements[item.name] = item.value;
            //     return formElements;
            // }, {}), // {URL, Login, Password}

            requestParams = {
                "method": "POST",
                "url": formParams.URL,
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                "body": `grant_type=password&username=${formParams.Login}&password=${formParams.Password}`
            };

        executeRequest(requestParams).then(response => {
            if (response.code === 200) {
                token = response.body.access_token;
                tokenField.val('SSO TOKEN:' + token);
                tokenField.removeClass('is-invalid');
                tokenField.addClass('is-valid');
            } else {
                token = '';
                tokenField.val('SSO TOKEN:' + response.body);
                tokenField.removeClass('is-valid');
                tokenField.addClass('is-invalid');
            }
        });
    }

    // loading статус
    function setLoadingStatus(element) {
        element.removeClass('btn-outline-success btn-danger');
        element.attr("disabled", true);
        element.html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Loading..');
    }

    // отображение статуса
    function setResultStatus(element, status) {
        element.removeClass('btn-outline-secondary');
        element.attr("disabled", false);
        element.addClass(`${status ? 'btn btn-success' : 'btn btn-danger'}`);
        element.html('Выполнить');
    }

    // получение параметров формы
    function collectParams(formElement) {
        let requestParams = formElement.serializeArray().reduce(function (formElements, item) {
            formElements[item.name] = item.value;
            return formElements;
        }, {});
        requestParams.needToken ? requestParams.needToken = true : requestParams.needToken = false; //в uncheked не попадает в объект параметров
        return requestParams;
    }

    function checkJson(str) {
        return !(typeof str == "string")
    }

    /*** РАБОТА С ШАБЛОНАМИ ***/
    // загрузка из диалогового окан
    $('#templateList').on('click', 'li.list-group-item', (event) => {
        if (event.target.nodeName != 'LI') {
            return false;
        }
        let name = $(event.target).text().trim();
        location.href = `/healthCheck/${name}`;
    });

    //удаление шаблона
    $('#templateList').on('click', 'img.list-item-remove', (event) => {
        if (confirm('Подтвердите удаление')) {
            let target = $(event.target).parent(),
                name = target.text().trim();
            $.get(`/fileAction/deleteFile?type=healthCheck&name=${name}`)
                .done(() => {
                    alert("Набор удален");
                    target.remove();
                })
                .fail(() => {
                    alert("Не удалось удалить набор");
                });
        }
    });

    // кнопка сохранения шаблона
    $('#saveTemplate').click(() => {
        let fileName = $("#templateName").val().trim();
        if (!fileName || fileName === "") {
            alert("Имя шаблона обязательно!");
            return false;
        }

        let requestsParams = $('#requestList form')
            .toArray()
            .map(requestForm => collectParams($(requestForm)));

        let requestBody = {
            name: fileName,
            source: JSON.stringify(requestsParams, null, 2)
        };
        $.ajax({
            type: "POST",
            url: "/fileAction/saveFile?type=healthCheck",
            data: JSON.stringify(requestBody),
            contentType: 'application/json'
        })
            .done(() => {
                alert("Ok");
                location.href = `/healthCheck/${fileName}`;
            })
            .fail(() => {
                alert("Не удалось сохранить файл");
            });
    });


});

function executeRequest(body) {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: "/proxy",
            data: JSON.stringify(body),
            contentType: 'application/json'
        })
            .done((data, textStatus, request) => {
                resolve({
                    code: request.status,
                    body: data
                });
            })
            .fail((request, textStatus, errorThrown) => {
                resolve({
                    code: request.status,
                    body: request.responseText
                })
            })
    })
}

function testString(requestId) {
    return `<div class="request">
    <div class="input-group">
        <div class="input-group-prepend">
                        <a class="btn btn-outline-secondary" data-toggle="collapse" href="#request-${requestId}"
                            role="button" aria-expanded="false" aria-controls="request-${requestId}"><span
                                aria-hidden="true"><img id="settings" src="../img/settings.png"
                                    alt="edit schemas"></span></a>
                    </div>
        <input type="text" class="form-control requestName" value=""
            aria-describedby="button-${requestId}" readonly>
        <div class="input-group-append">
            <button type="button" class="btn btn-outline-secondary" id="runButton" requestId="${requestId}">
                Выполнить
            </button>
            <a class="btn btn-outline-secondary" data-toggle="collapse" href="#response-${requestId}"
                role="button" aria-expanded="false" aria-controls="response-${requestId}">Ответ</a>
        </div>
    </div>
    <p></p>
    <!-- блок свойств запроса -->
    <div class="collapse" id="request-${requestId}">
        <div class="card card-body">
            <form id="requestForm-${requestId}">
                <input type="hidden" name="id" value="${requestId}">
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Название</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control nameField" name="name"
                            value="" placeholder="Название запроса">
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Тип запроса</label>
                    <div class="col-sm-10">
                        <select class="form-control" name="requestType">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">URL</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control URLField" name="URL"
                            value="" placeholder="URL Text">
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-2">Тело запроса (JSON)</div>
                    <div class="col-sm-10">
                        <textarea class="form-control" name="body"></textarea>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-sm-2">Нужен токен?</div>
                    <div class="col-sm-10">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" class="needTokenField" name="needToken">
                    </div>
                </div>
            </div>
            <div class="form-group row">
                <label class="col-sm-2 col-form-label">Код ответа</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control responseCodeField" name="responseCode"
                           value="" placeholder="Код ответа запроса">
                        </div>
                    </div>
                    <div class="float-right">
                        <button type="button" class="btn btn-outline-danger btn-sm deleteRequestButton"
                            requestId="${requestId}">Удалить
                        </button>
                    </div>
            </form>
        </div>
    </div>
    <!-- блок ответа -->
    <div class="collapse" id="response-${requestId}">
        <div class="card card-body">
            <label for="responseTextarea">Response</label>
            <textarea class="form-control" responseId="${requestId}" id="responseTextarea" rows="3"></textarea>
        </div>
    </div>
</div>`
}

