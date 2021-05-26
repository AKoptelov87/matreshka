const API = require('express').Router(),
    logger = require('../servJs/logger'),
    request = require('request');

/**
 * Проксирование запросов
 * в теле POST передаются все параметры
 * {
 *  "url": `http://srv3.ru:47333/ps/acc/api/role?short_output=true&user=${userName}`,
 *  "method": "GET",
 *  "headers": {
 *  "authorization": "Basic QWERTY000MQ=="
 *   }
 * }
 *
 */
API.post('/proxy', (req, res) => {
    logger.LOG(`proxy request \n pRequest params: ${JSON.stringify(req.body)}`, req.ip);
    try {
        request(req.body)
            .on('error', (err) => {
                logger.LOG(`error: ${err} \n return 500`, req.ip);
                res.status(500);
                res.send(`Something failed! error: ${err}`);
            })
            .pipe(res);
    } catch (err) {
        logger.LOG(`error: ${err} \n return 500`, req.ip);
        res.status(500);
        res.send(`Something failed! error: ${err}`);
    }

});

module.exports = API;