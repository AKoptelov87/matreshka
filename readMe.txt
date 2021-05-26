сервис управления клонами через одну страницу "Матрешка"

по всем вопросам и прделожениям обращаться Koptelov, Anton <AKoptelov87@gmail.com>




#### Установка:
1. Положить все содержимое проекта на сервер srv2-mon
2. Потребуется установленный node-js, если нету:
On RHEL, CentOS, you need to enable EPEL repository first.
`$ sudo yum install epel-release`

And, then install Nodejs using command:
`$ sudo yum install nodejs npm`

3. Установить пакеты командой: `npm i`

В файле *main_config.json* можно поправить порт приложения (по умолчанию 9999) и основные директории
Запускать через скрипт matreshka, в файле логов должна появиться строчка listening on port <port>:

- `> ./matreshka start`    -- запуск приложения
- `> ./matreshka stop`    -- остановить и убить процесс
- `> ./matreshka restart`  -- перезапустить приложение
- `> ./matreshka status`   -- найти процессы приложения


#### Настройка:
Основные настройки main_config
```json
{ 
    "port":9999, --порт приложения
    "configFolder":"configs", -- папка актуальных конфигов (в основном для локальной работы)
    "logSettings":{ -- параметры логирования
        "logFile":"matrena.log",
        "debugMode":true -- расширенная информация о действиях
    },
    "additionalFolders":{ --папки для работы с файлами фич, используются в common.js
        "operatorRolePackFolder":"additionalFolder/roleLists", -- папка для работы с ролями оператора
        "SQLrequestFolder":"additionalFolder/SQL"
    },
    "autoTestSettings":{ --параметры Java тестов
        "folder":"/u01/home/relstand/bin/Matreshka/autotests",
        "startCommand":"java -cp openApiHelper-1.0-jar-with-dependencies.jar:openApiHelper-1.0.jar:openApiHelper-1.0-tests.jar org.testng.TestNG -testjar openApiHelper-1.0-tests.jar"
    }
}
```


Настройка меню `configs\menuConfig.json`
Если вы хотите добавить новый пунк меню или исправить ссылку на ресурс, то открываем файлик `configs\menuConfig.json`
Меню 2х уровневое, разобраться не сложно (имя параметра -- название пункта, если параметр является объектом то будет разворачиваться):
```json
{ 
    "grafana":"http://srv2-mon.ru:3000/dashboard/db/main_gf?refresh=10s&orgId=1",
    "servers applications":{ 
        "srv2-app01":"/serverApplicationsPage?server=srv2-app01"
    },
    "tomcats":{ 
        "tomcat_auto1":"http://srv2-back1:18088/manager/html/",
        "tomcat_auto2":"http://srv2-back2:18089/manager/html/"
    },
    "ZMan (zookeeper)":"http://srv2-cd01:8888/#/GF",
    "nginx":{ 
        "frontend":"http://srv2-app01:9888/status",
        "backend":"http://srv2-app01:8889/status"
    }
}
```

при добавлении нового сервера, нужно указать имя нового json конфига из папки `configs\servers`


#### Настройка серверов:
Конфиги хранятся в формате json и имеют обязательную архитектуру:
```json
{
  "ssh": {
    "host": "srv2-app01",
    "user": "login",
    "password": "pass"
  },
  "logsPath": [  -- пути подлежащие очистке 
    "/u02/pservice/oapi/apache/logs",
    "/u02/pservice/oapi/apache_bkp/logs"
  ],
  "applications": {  -- приложения и их команды
    "APACHE_SBMS": {  -- название отображаемое на странице
      "path": "/u02/oapi/apache",  -- путь в котором выполняются команды
      "checkStatusCommand": "ps aux | grep 'http.*apache' | grep -v grep",  -- команда для проверки состояния приложения
      "command": {
        "start": "bin/apachectl start",  -- список команд для приложения, отображаются в виде кнопок на странице, выполняются:  cd "<path>" ; <command> 
        "stop": "bin/apachectl stop",
        "restart": "bin/apachectl restart"
      }
    }
  }
}
```

Логи чистятся командами:
`find -regextype posix-awk -regex '.*[0-9]+-[0-9]+-[0-9]+.*\.(log|jsonl|out)$' -delete;`
`find -regextype posix-awk -regex '.*\.(log|jsonl|out)\.[0-9 -.]+$' -delete;`
`find -regextype posix-awk -regex '.*\.(gz|zip|tmp)$' -delete;`
При необходимости добавить паттерн файлов логов, которые можно безбоязненно очистить на всех серверах и по всем путям, это делается в servJs/bash.js -> function clearSpace ()