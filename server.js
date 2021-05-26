/**
 * Created by Anton.Koptelov on 15.03.2018.
 */

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    logger = require('./servJs/logger'),
    readConfig = require('./servJs/readConfigs'),
    pageBuilder = require('./servAPI/pageBuilder'),
    APIserverAction = require('./servAPI/serverAction'),
    APIproxy = require('./servAPI/proxy'),
    APIfileAction = require('./servAPI/fileAction'),
    APIoracle = require('./servAPI/oracle'),
    APIcommon = require('./servAPI/common');


app.set('trust proxy', 'loopback');
app.set("view engine", "ejs");
app.set('views', `${__dirname}/public/html/model`);
//start server
app.listen(readConfig.mainConfig.port, function () {
    logger.LOG(`listening on port ${readConfig.mainConfig.port}!`);
});

app.use(bodyParser.json());

/**
 * перехват ошибок
 */
app.use(function (err, req, res, next) {
    logger.LOG(`ERROR: ${err.message}`);
    res.status(202).send(`Some error has happened! \n ${err.message}`);
});

/**
 * статично публикуем папки
 */

app.use(express.static(`${__dirname}/public`));

/**
 * импорт servAPI
 */

app.use(pageBuilder);
app.use(APIserverAction);
app.use(APIproxy);
app.use(APIfileAction);
app.use(APIoracle);
app.use(APIcommon);
