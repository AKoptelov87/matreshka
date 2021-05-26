var router = require('express').Router(),
    fs = require('fs'),
    readConfig = require('../servJs/readConfigs');

/**
 * Построение меню -- menu.html
 */
router.get('/menu.html', (req, res) => {
    let menuConfig = readConfig.menu;

    fs.readFile("public/html/model/menu.html", "utf8", function (error, page) {
        let menuItem = Object.keys(menuConfig)
            .map(item => {
                let itemHtml = '';
                if (typeof menuConfig[item] == 'object') {
                    itemHtml = `\n <li><a class="submenu" href="#"> ${item} </a><ul>`;
                    Object.keys(menuConfig[item]).forEach(subitem => {
                        if (typeof menuConfig[item][subitem] == 'string') {
                            itemHtml = itemHtml + `\n    <li><a href="${menuConfig[item][subitem]}" target="CONTENT">${subitem}</a></li>`
                        }
                        ;
                    });
                    itemHtml = itemHtml + "\n </ul></li>";

                    return itemHtml;
                } else if (typeof menuConfig[item] == 'string') {
                    return `\n <li><a class="simple" href="${menuConfig[item]}" target="CONTENT">${item}</a></li>`
                } else {
                    return " ошибка в конфигах меню ";
                }
            });

        page = page.replace(/{{menuItem}}/g, menuItem.join(' '));
        res.end(page);
    })

});

/**
 * Построение странички serverApplications.html
 */
router.get('/serverApplicationsPage', (req, res) => {
    let server = req.query.server,
        config = readConfig.serversConfig(server);

    fs.readFile("public/html/model/serverApplications.html", "utf8", function (error, page) {
        let serverApplicationsTableRows = Object.keys(config.applications)
            .map(apps => {
                let actionRow = Object.keys(config.applications[apps].command).map(action => {
                    return `<button class='btn btn-sm small btn-outline-success' onclick="sendGetRequest('serverAction/${server}/${apps}?action=${action}')">${action}</button>`;
                }).join(' ');
                return `<tr id="${apps}"><td title="${config.applications[apps].path}">${apps}</td><td id="status" onclick="getStatus( '${server}', '${apps}' )">Running?</td><td>${actionRow}</td></tr>`;
            });
        page = page
            .replace(/{{serverName}}/g, server)
            .replace("{{serverApplicationsTable}}", serverApplicationsTableRows.join(' '));

        res.end(page);
    })
});

router.get('/html/restClient', (req, res) => {
    let caseName = req.query.case_name,
        pathOfSuits = readConfig.mainConfig.healthCheckTestCaseFolder,
        suitList = fs.readdirSync(pathOfSuits),
        suitSource;
    try {
        suitSource = JSON.parse(fs.readFileSync(`${pathOfSuits}/${caseName}`, 'utf8'));
    } catch (e) {
        suitSource = JSON.parse(fs.readFileSync(`${pathOfSuits}/blank/blank`, 'utf8'));
    }
    res.render('restClient', {caseName: caseName, source: suitSource, suitList: suitList});
});


module.exports = router;
