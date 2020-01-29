'use strict';

function init () {
  let store
    , notStoredEvents = []
    , colName;

  const types = {
    debug: 'Debug',
    info: 'Info',
    warn: 'Warning',
    error: 'Error'
  };

  const colors = {
    'Reset': '\x1b[0m',
    'Debug': '\x1b[0m',
    'Info': '\x1b[1m',
    'Warning': '\x1b[33m',
    'Error': '\x1b[31m'
  };


  function logToConsole (logEvent) {

    const color = colors[logEvent.type];
    const message = `${color}${logEvent.message}${colors['Reset']}`;

    if (logEvent.type === 'Error') {
      return console.error(message);
    } else if (logEvent.type === 'Warning') {
      return console.warn(message);
    } else {
      return console.log(message);
    }
  }


  function logToDb (logEvent) {

    if (logEvent.type === 'Debug')
      return;

    if (!store) {
      notStoredEvents.push(logEvent);
    }
    else {
      const col = store.collection(colName);
      col.insert(logEvent)
        // let's not slow down the process by waiting for eventLog update, only catch errors
        .catch(function errorStoring (err) {
          log.ctx.error(err);
        });
    }
  }


  /**
   * Emit a message
   * @param {string} message
   * @param {string=} type - Level of severity
   */
  const log = function log (message, type) {
    type = type || types.debug;

    const logEvent = {
      timestamp: (new Date()).toISOString(),
      type,
      message
    };

    logToConsole(logEvent);
    logToDb(logEvent);
  };


  /**
   * Attach store to the logging service. Existing log messages
   * are going to be backfilled to the store and all future ones
   * will be saved to the store, too.
   * @param newStore
   * @param env
   * @returns {Promise<void>}
   */
  log.attachToStore = async function attachToStore (newStore, env) {
    store = newStore;

    if (store && notStoredEvents.length) {
      colName = env.eventLog_collection;
      const col = store.collection(colName);
      await col.insertMany(notStoredEvents);
      notStoredEvents.splice(0, notStoredEvents.length);
    }
  };


  log.types = types;

  /**
   * Emit a debug message
   * @param message
   */
  log.debug = function debug (message) {
    log(message, 'Debug');
  };

  /**
   * Emit an informational message
   * @param message
   */
  log.info = function info (message) {
    log(message, 'Info');
  };

  /**
   * Emit a warning
   * @param message
   */
  log.warn = function warn (message) {
    log(message, 'Warning');
  };

  /**
   * Emit a warning
   * @param message
   */
  log.warning = log.warn;

  /**
   * Emit an error
   * @param message
   */
  log.error = function error (message) {
    log(message, 'Error');
  };

  return log;
}

module.exports = init;