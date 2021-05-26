const API = require('express').Router(),
    logger = require('../servJs/logger'),
    bash = require('../servJs/bash.js'),
    oraRunner = require('../servJs/oraRunner.js');

function errorHandler(err) {
    logger.LOG(`error: ${err} \n return 500`, req.ip);
    res.status(500);
    res.send(`Something failed! error: ${err}`);
}

/**
 * Запуск авто тестов
 * GET http://localhost:9999/common/runAutoTests?suit=test
 *
 * bash.runAutoTest(suit)
 */
API.get('/common/runAutoTests', (req, res) => {
    let suit = req.query.suit;
    logger.LOG(`AutoTests: start suit ${suit}`, req.ip);
    bash.runAutoTest(suit).then(response => {
        res.send(response);
    }).catch(err => {
        errorHandler(err)
    });
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
API.post('/common/oracle/executeQuery', (req, res) => {
    logger.LOG(`SQL: executeQuery ${req.body.sqlQuery}`, req.ip);

    oraRunner.queryToOracle(req.body.sqlQuery, req.body.dbName, req.body.rowCount).then(response => {
        res.send(response);
    }).catch(err => {
        errorHandler(err)
    });
});

module.exports = API;