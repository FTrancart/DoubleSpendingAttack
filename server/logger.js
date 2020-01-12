const winston = require('winston');
const logrotate = require('winston-daily-rotate-file');
const fs = require('fs');

const tsFormat = () => ( new Date() ).toLocaleDateString('en-US') + ' - ' + ( new Date() ).toLocaleTimeString('en-US');

function build_logger(name, opt_log_path) {
  if (!fs.existsSync(opt_log_path)) {
    try {
      fs.mkdirSync(opt_log_path);
    } catch (err) {
      console.log(err)
    }
  }
  let logger;
  logger = new (winston.Logger)({
    exitOnError: false,
    transports: [
      new logrotate({
        name: "info",
        filename: (opt_log_path || '') + name + '.log',
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        json: false,
        level: 'info',
      }),
      new logrotate({
        name: "error",
        filename: (opt_log_path || '') + name + '-errors.log',
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        json: false,
        level: 'error',
      }),
      new logrotate({
        name: "debug",
        filename: (opt_log_path || '') + name + '-debug.log',
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        json: false,
        level: 'debug',
      })]
    });
  logger.add(winston.transports.Console, {
    level: 'debug',
    timestamp: tsFormat,
    colorize: true,
  })
  return logger;
}

module.exports = build_logger;
