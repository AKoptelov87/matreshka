var fs = require('fs'),
 configs =  require('./readConfigs').mainConfig.logSettings;

var logFile = fs.createWriteStream( configs.logFile, {flags : 'w'});


module.exports = {
    LOG: (message, ip) => {
        if (!ip) {ip = 'unknown IP'} else {ip = ip.split(':').pop()}
        let date = new Date(Date.now()).toLocaleString();
        logFile.write(`${ip} ; ${date}: ${message} \n`);
        console.log(message);
    },
    DEBUG: (message, ip) => {
        if (!configs.debugMode){
            console.log(message);
            return
        }
        if (!ip) {ip = 'unknown IP'} else {ip = ip.split(':').pop()}
        let date = new Date(Date.now()).toLocaleString();
        logFile.write(`${ip} ; ${date}: ${message} \n`);
        console.log(message);
    }
};