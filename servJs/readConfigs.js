/**
 * Created by Anton.Koptelov on 26.03.2018.
 */
const path = require('path'),
    fs = require("fs"),
    mainConfig = JSON.parse(fs.readFileSync(`${path.dirname(__dirname)}/sys_config.json`, 'utf8'));

let pathOfConfigs = path.join(path.dirname(__dirname), mainConfig.configFolder),
    menu = JSON.parse(fs.readFileSync(`${pathOfConfigs}/menuConfig.json`, 'utf8'));


/**
 * читаем все файлы в папке servers как объекты в srvApplConfigs
 */
let srvApplConfigs = {};
const serversConfigsFiles = fs.readdirSync(`${pathOfConfigs}/servers`);
serversConfigsFiles.forEach(file => {
    srvApplConfigs[path.parse(file).name] = JSON.parse(fs.readFileSync(`${pathOfConfigs}/servers/${file}`, 'utf8'));
});



module.exports = {
    serversConfig: (param) => srvApplConfigs[param],
    menu,
    mainConfig
};