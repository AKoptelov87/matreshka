const API = require('express').Router(),
    logger = require('../servJs/logger'),
    fs = require('fs'),
    path = require('path'),
    config = require('../servJs/readConfigs').mainConfig;

let confPath = {
    "role_pack": path.join(path.dirname(__dirname), config.operatorRolePackFolder),
    "sql_template": path.join(path.dirname(__dirname), config.oracleSettings.requestTemplateFolder),
    "healthCheck": path.join(path.dirname(__dirname), config.healthCheckTestCaseFolder)
};

/**
 * Работа с файлами
 *
 */

/**
 * Получение списка сохраненных файлов
 * GET http://localhost:9999/fileAction/getLists?type=role_pack
 *  return array
 */
API.get('/fileAction/getLists', (req, res) => {
    let folder = confPath[req.query.type];
    logger.LOG(`get file list from folder: ${folder}`, req.ip);
    let roleListFiles = fs.readdirSync(folder);
    res.send(roleListFiles);
});

/**
 * Чтение файла
 * GET localhost:9999/fileAction/readFile?type=config&name=oracleSchemes.json
 */
API.get('/fileAction/readFile', (req, res) => {
    let folder = confPath[req.query.type],
        fileFullName = `${folder}/${req.query.name}`;

    logger.LOG(`read file from server: ${fileFullName}`, req.ip);

    let roleList = fs.readFileSync(fileFullName, 'utf8');
    res.send(roleList);
});

/**
 * сохранение файла
 * POST localhost:9999/fileAction/?type=role_pack
 * body:
 * {
 *	"name": "test1",
 *	"source": " {'param': 22} "
 * }
 */
API.post('/fileAction/saveFile', (req, res) => {
    logger.LOG(`save`);
    let folder = confPath[req.query.type],
        fileFullName = `${folder}/${req.body.name}`,
        source = req.body.source;

    if (!req.body.name) {
        res.status(500);
        res.send('ERROR: param name required');
        return;
    }

    if (req.query.type === "sql_template") {
        source = JSON.stringify(source, null, 2);
    }
    logger.LOG(`save file to server: ${fileFullName}`, req.ip);
    fs.writeFileSync(fileFullName, source);

    res.send('OK');
});

/**
 * Удаление файла
 * GET localhost:9999/fileAction/deleteFile?type=role_pack&name=test
 *
 */
API.get('/fileAction/deleteFile', (req, res) => {
    let folder = confPath[req.query.type],
        fileFullName = `${folder}/${req.query.name}`;
    logger.LOG(`delete file from server: ${fileFullName}`, req.ip);
    fs.unlinkSync(fileFullName);
    res.send('OK');
});


module.exports = API;