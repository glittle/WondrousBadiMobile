




function getMessage(key, obj, defaultValue) {
  var rawMsg = _cachedMessages[key];
  if (!rawMsg) {
    //rawMsg = chrome.i18n.getMessage(key);
    rawMsg = getRawMessage(key);
    _cachedMessages[key] = rawMsg;
  } else {
    // _cachedMessageUseCount++; --> good for testing
    //    console.log(_cachedMessageUseCount + ' ' + key);
  }

  var msg = rawMsg || defaultValue || '{' + key + '}';
  if (obj === null || typeof obj === 'undefined' || msg.search(/{/) === -1) {
    return msg;
  }

  var before = msg;
  var repeats = 0;
  while (repeats < 5) { // failsafe
    msg = msg.filledWith(obj);
    if (msg === before) {
      return msg;
    }
    if (msg.search(/{/) === -1) {
      return msg;
    }
    before = msg;
    repeats++;
  }
  return msg;

}


function getRawMessage(key) {

}

function loadLocaleInfo() {
  // read English, then overwrite with current locale
  readFile(cordova.file.applicationDirectory + '/www/locales/en/messages.json');
}

function readFile(fileEntry) {

  var x = $.getJSON('locales/en/messages.json');
  console.log(x);
}

function sharedStartup() {
  loadLocaleInfo();
}