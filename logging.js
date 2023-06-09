const winston = require('winston')
const config = require('config')
const transports = config.get('application.sub-modules.logging.transports')
const appName = config.get('application.name')
const fileRoot = __dirname
const chalk = require('chalk')
const path = require('path')

function options(level, message) {
  let transport, filePath = undefined
  let format = winston.format
  let data = {
    defaultMeta: { service: `${appName}` },
    exitOnError: false,
    transports: []
  }
  let values = Object.values(transports);
  for (let increment = 0; increment < values.length; increment++) {
    if (values[increment]['enabled']) {
      let transportType = values[increment]['type']
      switch(transportType) {
        case "console":
          transport = new winston.transports.Console({
            format: format.combine(
              format.colorize(),
              format.printf(() => msg(level, message))
            )
          })
        break
        case "file":
          let date = dateHandler()
          switch (values[increment]['rotation']) {
            case true: filePath = `${fileRoot}\\${values[increment]['path']}\\${appName}.${date}.${level}.log`; break
            default: filePath = `${fileRoot}\\${values[increment]['path']}\\${appName}.${level}.log`; break
          }
          transport = new winston.transports.File({
            format: format.combine(
              format.json(), format.prettyPrint()
            ),
            filename: path.resolve(filePath)
          })
        break
      }
      data.transports.push(transport)
    }
  }
  return data
}

function log(level, message) {
  let loggerOptions = options(level, message)
  let winstonLogger = winston.createLogger(loggerOptions)
  let transports = loggerOptions.transports[0]
  switch (transports) {
    case undefined:
      switch (transports['console']['enabled']) {
        case false:
          let object = {
            messages: {
              exception: { message: msg('exception', `throwed an exception, Winston Options: ${transports}`) },
              info: { message: msg('info', "It's suggested to enable console logging in the configuration as the logger function has failed") }
            }
          }
          console.log(object.messages)
        break
        default: return
      }
    break
    default: winstonLogger.log(level, message); break
  }
}

function dateHandler() {
  let date = new Date(); let data = []; let message = ""
  data = [ date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() ]
  for (let increment = 0; increment < data.length; increment++) {
    let value = data[increment]; let tempChar = ""
    switch (true) {
      case (value > 0 && value < 10): tempChar = ".0"; break;
      case (increment > 1): tempChar = "."; break;
    }
    message += `${tempChar}${value}`
  }
  return message.replace(':', '')
}

function msg(level, message) {
  let serviceName = appName.replaceAll('-', " ").toUpperCase()
  date = dateHandler()
  switch(level) {
    case "info": return `[${chalk.green(date)}] [${chalk.green(level)}] [${chalk.green(serviceName)}] ${chalk.green(`${message}.`)}`;
    case "warning": return `[${chalk.yellow(date)}] [${chalk.yellow(level)}] [${chalk.yellow(serviceName)}] ${chalk.yellow(`${message}.`)}`;
    case "error": return `[${chalk.red(date)}] [${chalk.red(level)}] [${chalk.red(serviceName)}] ${chalk.red(`${message}.`)}.`;
  }
}

module.exports = { log }
