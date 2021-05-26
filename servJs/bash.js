/**
 * Created by Anton.Koptelov on 16.03.2018.
 */

const logger = require('./logger'),
    ssh = require('ssh-exec'),
    localExecute = require('child_process').exec,
    configs = require('./readConfigs').mainConfig.autoTestSettings,
    configList = require('./readConfigs').serversConfig;

function sshExecute(command, sshConfig) {
    return new Promise((resolve, reject) => {
        ssh(command, sshConfig, function (err, stdout, stderr) {
            if (err && !Number.isInteger(err.code)) {
                reject(err.message, stdout, stderr);
            }
            resolve(stdout || stderr);
        })
    })
}


module.exports = {
    /**
     * Выполнение произвольной команды
     * @param server - имя конфиг файла
     * @param command - команда
     *
     * Return: result <stdout || stderr>
     */
    commandExecute: (server, command) => {
        let sshConfig = configList(server).ssh;
        logger.DEBUG(`${server}: execute ssh command \n  >> ${command}`);
        return sshExecute(command, sshConfig).then(result => {
            logger.DEBUG(`  << ${result}`);
            return result
        });
    },

    /**
     * получение места на сервере
     * server - имя конфиг файла
     *
     * Return: result <stdout || stderr>
     */
    getSpace: (server) => {
        let sshConfig = configList(server).ssh;
        let command = 'df -h | column -t';
        logger.DEBUG(`${server}: execute ssh command \n  >> ${command}`);
        return sshExecute(command, sshConfig).then(result => {
            logger.DEBUG(`  << ${result}`);
            return result
        });
    },

    /**
     * Очистка места на сервере
     * @param server - имя конфиг файла
     *
     * Return: result <stdout || stderr>
     */
    clearSpace: (server) => {
        let sshConfig = configList(server).ssh,
            logsPath = configList(server).logsPath;
        let command = `pathList=(${logsPath.join(' ')});
                 for path in \${pathList[*]}; do
                   if [ -d $path ]; then 
                   cd $path;
                     find -regextype posix-awk -regex '.*[0-9]+-[0-9]+-[0-9]+.*\.(log|jsonl|out)$' -delete;
                     find -regextype posix-awk -regex '.*\.(log|jsonl|out)\.[0-9 -.]+$' -delete;
                     find -regextype posix-awk -regex '.*\.(gz|zip|tmp)$' -delete;
                     echo $path cleared;
                   else
                   echo "$path : dir_not_exist";
                   fi                   
                   done;
                 `;
        logger.DEBUG(`${server}: execute ssh command \n  >> ${command}`);
        return sshExecute(command, sshConfig).then(result => {
            logger.DEBUG(`  << ${result}`);
            return result
        });
    },

    /**
     * Получение статуса приложения на сервере
     * выполняется команда из параметра checkStatusCommand
     *
     * @param server - имя конфиг файла
     * @param appName - имя приложения
     *
     * Return: true || false
     */
    getApplicatoionStatus: (server, appName) => {
        let sshConfig = configList(server).ssh,
            config = configList(server);
        let command = config.applications[appName].checkStatusCommand;
        logger.DEBUG(`${server}: execute ssh command \n  >> ${command}`);
        return sshExecute(command, sshConfig).then(result => {
            logger.DEBUG(`  << ${result}`);
            if (!result) {
                return false
            }
            return true
        });
    },

    /**
     * Выполнение действия приложения на сервере из конфигов
     * выполняется команда из блока параметров command
     *
     * @param server - имя конфиг файла
     * @param appName - имя приложения
     * @param action - действие из списка command
     *
     * @Return: result <stdout || stderr>
     */
    makeApplicatoionCommand: (server, appName, action) => {
        let sshConfig = configList(server).ssh,
            config = configList(server);
        let command = `cd ${config.applications[appName].path}; ${config.applications[appName].command[action]}`;
        logger.DEBUG(`${server}: execute ssh command \n  >> ${command}`);
        return sshExecute(command, sshConfig).then(result => {
            logger.DEBUG(`  << ${result}`);
            return result;
        });
    },

    /**
     * Запуск авто тестов
     * @param suit - название xml
     * @return  result <stdout || stderr>
     */
    runAutoTest: (suit) => {
        let command = `cd ${configs.folder}; ${configs.startCommand} ${suit} -DisFiddlerAsProxy=false`;
        logger.DEBUG(`AutoTest: start ${suit} \n  >> ${command}`);
        return new Promise((resolve, reject) => {
            localExecute(command, (error, stdout, stderr) => {
                logger.DEBUG(`  << stdout: ${stdout} \n  <<  stderr: ${stderr} \n  <<  error: ${error}`);
                resolve(stdout || stderr || error);
            })
        }).then(std => {
            return std
        });
    }
};