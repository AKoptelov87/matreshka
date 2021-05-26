const API = require('express').Router(),
    logger = require('../servJs/logger'),
    bash = require('../servJs/bash.js');

/**
 * Перехват ошибок
 * @param err
 */
function errorHandler(err) {
    logger.LOG(`error: ${err} \n return 500`, req.ip);
    res.status(500);
    res.send(`Something failed! error: ${err}`);
}

/**
 *Запроc свободного места на диске
 * GET http://localhost:9999/{server}/spase
 *
 * bash.getSpace(server)
 */
API.get('/serverAction/:server/space', (req, res) => {
    let server = req.params.server;
    logger.LOG(`${server}: get space`, req.ip);
    bash.getSpace(server).then(space => {
        res.send(space);
    }).catch(err => {
        errorHandler(err)
    });
});

/**
 * Очистка места на диске
 * Удаление архивных логов
 * GET http://localhost:9999/{server}/clearSpace
 *
 * bash.clearSpace(server)
 */
API.get('/serverAction/:server/clearSpace', (req, res) => {
    let server = req.params.server;
    logger.LOG(`${server}: clear space`, req.ip);
    bash.clearSpace(server).then(response => {
        res.send(response);
    }).catch(err => {
        errorHandler(err)
    });
});

/**
 * Работа с приложениями на серверах
 * GET http://localhost:9999/{server}/{appname} - получает статус исходя из checkStatusCommand конфигов
 * GET http://localhost:9999/{server}/{appname}&action={action} - выполняет action исходя из command конфигов
 *
 * bash.makeApplicatoionCommand(server, appName, action)
 * bash.getApplicatoionStatus(server, appName)
 */
API.get('/serverAction/:server/:appname', (req, res) => {
    let server = req.params.server,
        appName = req.params.appname,
        action = req.query.action;

    if (action) { //Если есть параметр action - выполняем команду
        bash.makeApplicatoionCommand(server, appName, action).then(stdout => {
            res.send(stdout);
        }).catch(err => {
            errorHandler(err)
        });
    } else { //запрос без параметра - получаем статус
        bash.getApplicatoionStatus(server, appName).then(status => {
            res.send(status);
        }).catch(err => {
            errorHandler(err)
        });
    }
});

module.exports = API;