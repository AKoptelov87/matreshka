$(function () {
    //рендеринг сохраненных схем из конфига
    renderSchemes();

    /*** РАБОТА С СХЕМАМИ ***/
    // рендеринг сохраненных запросов при смене схемы
    $('#schemas').change(() => renderSavedTemplates());

    // редактирование схемы
    $('#schemasList').on('click', 'li.list-group-item', (event) => {
        if (event.target.nodeName != 'LI') {
            return false;
        }
        let name = $(event.target).text().trim();
        $.get('/oracle/getSchemes')
            .done((schemeConfig) => {
                let currentScheme = schemeConfig[name];
                $('#schemeName').val(name);
                $('#schemeLogin').val(currentScheme.user);
                $('#schemePassword').val(currentScheme.password);
                $('#schemeConnectionString').val(currentScheme.connectString);
            })
            .fail(() => {
                alert("Не удалось загрузить схему")
            });
    });

    //сохранение схемы
    $('#saveScheme').click(() => {
        if (confirm('Подтвердите сохранение')) {
            $.ajax({
                type: "POST",
                url: "/oracle/saveScheme",
                data: `{             
            "name": "${$('#schemeName').val()}",
            "user": "${$('#schemeLogin').val()}",
            "password": "${$('#schemePassword').val()}",
            "connectString": "${$('#schemeConnectionString').val()}" 
            }`,
                contentType: 'application/json'
            }).done(() => {
                renderSchemes();
                alert("Ok");
            }).fail(() => {
                alert("Не удалось сохранить схему")
            });
        }
    });

    //удаление схемы
    $('#schemasList').on('click', 'img#remove_icon', (event) => {
        if (confirm('Подтвердите удаление')) {
            let target = $(event.target).parent(),
                name = target.text().trim();
            $.ajax({
                url: `/oracle/deleteScheme?name=${name}`,
                type: 'delete'
            }).done(() => {
                renderSchemes();
            }).fail(() => {
                alert("Не удалось удалить схему")
            });
        }
    });

    /*** РАБОТА С ШАБЛОНАМИ ***/
    // кнопка сохранения шаблона
    $('#saveTemplate').click(() => {
        let fileName = $("#templateName").val().trim(),
            sqlQuery = editor.getValue(),
            dbName = $("#schemas").val(),
            rowCount = $("#rowCount").val();
        if (!fileName || fileName === "") {
            alert("Имя шаблона обязательно!");
            return false;
        }
        let requestBody = {
            name: `${fileName}@${dbName}`,
            source: {
                sqlQuery: sqlQuery.replace(/\n/g, ' <br> '),
                dbName: dbName,
                rowCount: rowCount
            }
        };
        $.ajax({
            type: "POST",
            url: "/fileAction/saveFile?type=sql_template",
            data: JSON.stringify(requestBody),
            contentType: 'application/json'
        })
            .done(() => {
                renderSavedTemplates();
                alert("Ok");
            })
            .fail(() => {
                alert("Не удалось сохранить файл");
            });
    });

    // кнопка удаления шаблона
    $('#templateList').on('click', 'img#remove_icon', (event) => {
        var target = $(event.target).parent();
        var name = target.text().trim();

        $.get(`/fileAction/deleteFile?type=sql_template&name=${name}`)
            .done(() => {
                renderSavedTemplates();
                alert("Ok");
            })
            .fail(() => {
                alert("Не удалось удалить шаблон")
            });
    });

    // загрузка из диалогового окан
    $('#templateList').on('click', 'li.template-list__item', (event) => {
        if (event.target.nodeName != 'LI') {
            return false;
        }
        let name = $(event.target).text().trim();

        $.get(`/fileAction/readFile?type=sql_template&name=${name}`)
            .done((response) => {
                response = JSON.parse(response);
                let sqlQuery = response.sqlQuery,
                    dbName = response.dbName,
                    rowCount = response.rowCount;

                editor.setValue(sqlQuery.replace(/ <br> /g, '\n'));
                $('#schemas').val(dbName);
                $('#rowCount').val(rowCount);
                $('#templateName').val(name.split('@')[0]);
                renderSavedTemplates();
            })
            .fail(() => {
                alert("Не удалось загрузить файл")
            });
        $('.load-dialog').toggle();
    });

    // загрузка из списка на основной странице
    $('#currentSchemeTemplatesList').on('click', 'li.list-group-item', (event) => {
        let schemaName = $("#schemas").val(),
            name = $(event.target).text().trim() + '@' + schemaName;

        $.get(`/fileAction/readFile?type=sql_template&name=${name}`)
            .done((response) => {
                response = JSON.parse(response);
                let sqlQuery = response.sqlQuery,
                    dbName = response.dbName,
                    rowCount = response.rowCount;

                editor.setValue(sqlQuery.replace(/ <br> /g, '\n'));
                $('#rowCount').val(rowCount);
                $('#templateName').val(name.split('@')[0]);
            })
            .fail(() => {
                alert("Не удалось загрузить файл")
            });
    });

    //кнопка выполнения запроса
    $('#execute').click(() => {
        let requestBody = {
            sqlQuery: editor.getValue(),
            dbName: $("#schemas").val(),
            rowCount: parseInt($("#rowCount").val())
        };
        executeQuery(requestBody).then((result) => {
            $('#outputJSON').val(JSON.stringify(result, null, 2));
            let resultTable = "",
                column = [];
            if (result.metaData) {
                let resultTableHead = '<thead><tr>';
                result.metaData.forEach(data => {
                    resultTableHead += '<th>' + data.name + '</th>';
                    column.push(data.name);
                });
                resultTableHead += '</tr></thead>';
                resultTable = resultTableHead;
            }
            if (result.rows) {
                let resultTableBody = '<tbody>';
                result.rows.forEach(data => {
                    resultTableBody += '<tr>';
                    for (var i = 0; i < column.length; i++) {
                        resultTableBody += '<td>' + data[column[i]] + '</td>';
                    }
                    resultTableBody += '</tr>';
                });
                resultTable += resultTableBody + '<tbody>';
            }
            $('#resultTable').html(resultTable);
        })
    });

});


function renderSavedTemplates() {
    let allTemplateList = $('#templateList'),
        shortList = $('#currentSchemeTemplatesList'),
        schemaName = $("#schemas").val(),
        re = new RegExp(`@${schemaName}$`, 'i');

    $.get('/fileAction/getLists?type=sql_template').done(templates => {
        allTemplateList.empty();
        shortList.empty();
        templates.forEach(template => {
            allTemplateList.append(`<li class="list-group-item list-group-item-action">${template}<img id="remove_icon" src="../img/remove.png"></li>`);
            if (re.test(template)) {
                shortList.append(`<li class="list-group-item list-group-item-action">${template.split('@')[0]}</li>`);
            }
        })
    });
}

function renderSchemes() {
    let schemeSelect = $('#schemas'),
        schemeList = $('#schemasList');
    $.get('/oracle/getSchemes')
        .done((schemeConfig) => {
            schemeSelect.empty();
            schemeList.empty();
            Object.keys(schemeConfig).forEach(schemeName => {
                // добавляем селект на основной странице
                schemeSelect.append(`<option>${schemeName}</option>`);
                // добавляем в список на диалоге настроек
                schemeList.append(`<li class="list-group-item list-group-item-action">${schemeName}<img id="remove_icon" src="../img/remove.png"></li>`);
            });
            renderSavedTemplates();
        })
}


function executeQuery(body) {
    $('#wait').toggle();
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: "/oracle/executeQuery",
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