// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
  "use strict";

  //  var settings = {
  //    refreshTimeout: null
  //  }
  function onDeviceReady() {
    log('device ready'); 

    // Handle the Cordova pause and resume events
    document.addEventListener('pause', onPause.bind(this), false);
    document.addEventListener('resume', onResume.bind(this), false);

    cordova.plugins.notification.local.registerPermission(function (granted) {
    });

    renderUi();
    attachHandlers();
  }

  function renderUi() {
    sharedStartup(onReady, locationReady);
  }

  function locationReady() {
    var answers = [];
    answers.push({ v: _locationLat, t: 'Latitude', c: 'where' });
    answers.push({ v: _locationLong, t: 'Longitude', c: 'where' });

    showAnswers('#where-data', answers);
  }

  function attachHandlers() {
    $('#btnRefresh').click(function () {
      refreshDateInfo();
      show();
    });
    $('.page').on('swipe', function () {
      log('swipe');
    });
  }

  function onReady() {
    show();
    $('#btnRefresh').show();
  }

  function show() {
    doNotification();
    showTimes();
  }

  function doNotification() {
    log('showing notification now');
    cordova.plugins.notification.local.schedule({
      id: 0,
      title: '{bDay} {bMonthNamePri} {bYear}'.filledWith(_di),
      text: '{nearestSunset}'.filledWith(_di),
      //badge: _di.bDay,
      icon: 'file://images/Badi19-96.png', //?? not working
      ongoing: true
    });
  }

  function setNextRefreshAt(refreshTime, midnightUpdate) {
    if (!midnightUpdate && moment().date() !== refreshTime.date()) {
      // update at midnight before the next sunset
      var midnight = moment(refreshTime).set({ 'hour': 0, 'minute': 0, 'second': 1 });
      setNextRefreshAt(midnight, true);
      setNextRefreshAt(refreshTime);
      return;
    }

    log('setting refresh for ' + refreshTime.toString());

    setFocusTime(refreshTime.toDate());
    refreshDateInfo();

    var options = {
      id: 0,
      title: '{bDay} {bMonthNamePri} {bYear}'.filledWith(_di),
      text: '{nearestSunset}'.filledWith(_di),
      at: refreshTime.toDate(),
      icon: 'file://images/Badi19-96.png', //?? not working
      ongoing: true
    };

    if (midnightUpdate) {
      options.sound = null;
    }

    cordova.plugins.notification.local.schedule(options);

    //  chrome.alarms.create('refresh', { when: m.valueOf() });
    //    var ms = m.diff(moment());
    //    log('timeout in ' + ms);
    //    clearTimeout(settings.refreshTimeout);
    //    settings.refreshTimeout = setTimeout(function () {
    //      refreshDateInfo();
    //      doNotification();
    //      show(); // will set next timeout
    //    }, ms);
  }

  function showAnswers(selector, answers) {
    $(selector)
      .html($.map(answers, function (ans, i) {
        return `<div class="line ${ans.c || ''}"><label>${ans.t}</label> <span>${ans.v}</span></div>`;
      }))
      .show();
  }


  function showTimes() {
    var latitude = _locationLat;
    var longitude = _locationLong;

    var readableFormat = 'ddd, MMM D [at] HH:mm';
    var answers = [];

    var now = moment(_di.currentTime);
    var noon = moment(now).hour(12).minute(0).second(0);
    var tomorrowNoon = moment(noon).add(24, 'hours');

    var sun1 = sunCalc.getTimes(noon, latitude, longitude);
    var sunrise1 = moment(sun1.sunrise);
    var sunset1 = moment(sun1.sunset);


    answers.push({ t: '{bDay} {bMonthNamePri} {bYear}'.filledWith(_di), v: '', c: 'ui-li-divider ui-bar-a' });

    answers.push({ t: 'Day of Month', v: '{bDayNamePri} / {bDayNameSec} / {bDay}'.filledWith(_di) });
    answers.push({ t: 'Month', v: '{bMonthNamePri} / {bMonthNameSec} / {bMonth}'.filledWith(_di) });
    answers.push({ t: 'Day of Week', v: '{bWeekdayNamePri} / {bWeekdayNameSec} / {bWeekday}'.filledWith(_di) });
    answers.push({ t: 'Element of Year', v: '{element}'.filledWith(_di) });
    answers.push({ t: 'Year', v: 'Year {bYearInVahid} of Vahid {bVahid} / {bYear}'.filledWith(_di) });

    showAnswers('#day-data', answers);

    answers = [];

    if (now.isAfter(sunset1)) {
      // eve of day1 into day2
      answers.push({ t: `Day started at sunset:`, v: sunset1.format(readableFormat) });

      var sun2 = sunCalc.getTimes(tomorrowNoon, latitude, longitude);
      var sunrise2 = moment(sun2.sunrise);
      var sunset2 = moment(sun2.sunset);

      if (now.isBefore(sunrise2)) {
        answers.push({ t: `Now:`, v: now.format(readableFormat), c: 'now' });
        answers.push({ t: `Sunrise:`, v: sunrise2.format(readableFormat) });
      } else {
        answers.push({ t: `Sunrise:`, v: sunrise2.format(readableFormat) });
        answers.push({ t: `Now:`, v: now.format(readableFormat), c: 'now' });
      }
      answers.push({ t: `Day will end at sunset:`, v: sunset2.format(readableFormat) });

      setNextRefreshAt(sunset2);
    } else {
      // get prior sunset
      var sun0 = sunCalc.getTimes(moment(noon).subtract(24, 'hours'), latitude, longitude);
      var sunset0 = moment(sun0.sunset);

      answers.push({ t: `Day started at sunset:`, v: sunset0.format(readableFormat) });
      if (now.isBefore(sunrise1)) {
        answers.push({ t: `Now:`, v: now.format(readableFormat), c:'now' });
        answers.push({ t: `Sunrise:`, v: sunrise1.format(readableFormat) });
      } else {
        answers.push({ t: `Sunrise:`, v: sunrise1.format(readableFormat) });
        answers.push({ t: `Now:`, v: now.format(readableFormat), c: 'now' });
      }
      answers.push({ t: `Day will end at sunset:`, v: sunset1.format(readableFormat) });

      setNextRefreshAt(sunset1);
    }


    showAnswers('#times-data', answers);

  }


  function onPause() {
    // TODO: This application has been suspended. Save application state here.
    log('being paused');
  }

  function onResume() {
    // TODO: This application has been reactivated. Restore application state here.
    log('resumed');

    renderUi();

    // need to reset the timeout??
    // need to use alarms to wake at a known time
  }

  document.addEventListener('deviceready', onDeviceReady);

})();