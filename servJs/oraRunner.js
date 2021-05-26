// Подключаем instantclient в окружение

const path = require('path'),
    fs = require('fs'),
    logger = require('./logger'),
    configs = require('./readConfigs').mainConfig.oracleSettings;

process.env['PATH'] = path.join(__dirname, '/../instantclient') + ';' + process.env['PATH'];
const oracledb = require('oracledb');

/**
 * работа с конфигами оракла
 */
let  OraSchemes;
function resetOraSchemes() {
    OraSchemes = JSON.parse(fs.readFileSync(configs.schemeConfigsFile, 'utf8'));
};

resetOraSchemes();

let oraSchemesAction = {
    get: () => { return OraSchemes },
    save: (scheme) => {
        if ( !scheme.name || !scheme.user || !scheme.password || !scheme.connectString ) { throw new Error('отсутствуют обязательные параметры');}
        OraSchemes[scheme.name] = {
            user: scheme.user,
            password: scheme.password,
            connectString: scheme.connectString
        };
        fs.writeFileSync(configs.schemeConfigsFile, JSON.stringify(OraSchemes, null, 2));
        resetOraSchemes();
        return {
            name: scheme.name,
            status: 'Saved'
        }
    },
    delete: (schemeName) => {
        delete OraSchemes[schemeName];
        fs.writeFileSync(configs.schemeConfigsFile, JSON.stringify(OraSchemes, null, 2));
        resetOraSchemes();
        return {
            name: schemeName,
            status: 'Deleted'
        }
    },
};


/**
 * отправка запроса в бд
 * @param dbName
 * @param sqlQuery
 * @param fetchRowCount
 * @return {Promise<*>}
 */
async function sqlExecute(dbName, sqlQuery, fetchRowCount = configs.fetchRowDefault) {
    let connectionConfig = OraSchemes[dbName],
        options = {
            outFormat: oracledb.OBJECT,
            fetchArraySize: fetchRowCount,
            maxRows: fetchRowCount
        },
        connection;
    try {
        let binds = {};
        logger.DEBUG(`SQL >> get connection to ${dbName}: ${connectionConfig.connectString}`);
        connection = await oracledb.getConnection(connectionConfig);
        let result = await connection.execute(sqlQuery, binds, options);
        return result;
    } catch (err) {
        logger.DEBUG(`SQL << ${err}`);
        return err.message;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                logger.DEBUG(`SQL << ${err}`);
                return err;
            }
        }
    }

};


module.exports = {
    oraSchemesAction,
    queryToOracle: (sqlQuery, dbname, rowCount) => {
        return sqlExecute(dbname, sqlQuery, rowCount).then(result => {
            logger.LOG(`SQL: << table: ${JSON.stringify(result.metaData)}`);
            return result;
        })
    }
    // /**
    //  * Запуск sql скриптов
    //  * @param suit - название sql
    //  * @return  result <stdout || stderr>
    //  */
    // runOraScripts: (scriptName, params) => {
    //     let command = `cd ${configs.folder}; ${configs.startCommand} -xmlpathinjar ${suit}.xml -d reports/${suit}`;
    //     logger.DEBUG(`AutoTest: start ${suit} \n  >> ${command}`);
    //     return new Promise((resolve, reject) => {
    //         localExecute(command, (error, stdout, stderr) => {
    //             logger.DEBUG(`  << stdout: ${stdout} \n  <<  stderr: ${stderr} \n  <<  error: ${error}`);
    //             resolve(stdout || stderr || error);
    //         })
    //     }).then(std => {
    //         return std
    //     });
    // }
};

