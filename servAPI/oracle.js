const API = require('express').Router(),
    logger = require('../servJs/logger'),
    oraRunner = require('../servJs/oraRunner.js');

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
 * Получение схем
 * localhost:9999/
 */
API.get('/oracle/getSchemes', (req, res) => {
    logger.LOG(`SQL: getSchemes`, req.ip);
    try {
        res.send(oraRunner.oraSchemesAction.get());
    } catch (err) {
        errorHandler(err)
    }
});

/**
 * Добавление схемы
 * POST localhost:9999/oracle/saveScheme
 * {
 *     name: ""
 *     user: ""
 *     password: ""
 *     connectString: ""
 * }
 */
API.post('/oracle/saveScheme', (req, res) => {
    logger.LOG(`SQL: saveScheme ${req.body.name}`, req.ip);
    try {
        if (!req.body.name) {
            throw new Error('отсутствует обязательный параметр name')
        }
        let scheme = {
            "name": req.body.name,
            "user": req.body.user || "",
            "password": req.body.password || "",
            "connectString": req.body.connectString || ""
        };
        res.send(oraRunner.oraSchemesAction.save(scheme));
    } catch (err) {
        errorHandler(err)
    }
});

/**
 * Удаление схемы
 *  /oracle/deleteScheme?name=schemeName
 */
API.delete('/oracle/deleteScheme', (req, res) => {
    logger.LOG(`SQL: deleteScheme ${req.query.name}`, req.ip);
    try {
        if (!req.query.name) {
            throw new Error('отсутствует обязательный параметр name')
        }
        res.send(oraRunner.oraSchemesAction.delete(req.query.name));
    } catch (err) {
        errorHandler(err)
    }
});


/**
 * Выполнение SQL запроса
 * POST http://localhost:9999/oracle/executeQuery
 * body {
 *   sqlQuery:"select * from VERSIONS",
 *   dbName: "ORA01",
 *   rowCount: 10,
 *   templateParams: {
 *     param_id: 123
 *   }
 * }
 */
API.post('/oracle/executeQuery', (req, res) => {
    logger.LOG(`SQL: executeQuery ${req.body.sqlQuery}`, req.ip);
    oraRunner.queryToOracle(req.body.sqlQuery, req.body.dbName, req.body.rowCount).then(response => {
        res.send(response);
    }).catch(err => {
        errorHandler(err)
    });
});

module.exports = API;