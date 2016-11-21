// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
  "use strict";

  document.addEventListener('deviceready', onDeviceReady.bind(this), false);

  function onDeviceReady() {
    // Handle the Cordova pause and resume events
    document.addEventListener('pause', onPause.bind(this), false);
    document.addEventListener('resume', onResume.bind(this), false);

    cordova.plugins.notification.local.registerPermission(function (granted) {
    });

    sharedStartup(onReady);

    attachHandlers();
  }

  function attachHandlers() {
    $('#btnRefresh').click(function () {
      refreshDateInfo();
      show();
    });
  }

  function onReady() {
    show();
    $('#btnRefresh').show();
  }

  function show() {
    showTimes();
    doNotification();
  }

  function doNotification() {
    cordova.plugins.notification.local.schedule({
      id: 0,
      title: '{bDay} {bMonthNamePri} {bYear}'.filledWith(_di),
      text: '{nearestSunset}'.filledWith(_di),
      // at: new Date(new Date().getTime() + 100) -- NOW!
      badge: _di.bDay,
      icon: 'res://Badi19',
      ongoing: true
    });
}

  function showAnswers(selector, answers) {
    $(selector)
      .html($.map(answers, function (ans, i) {
        return `<div class="${ans.c || ''}"><strong>${ans.t}</strong> <span>${ans.v}</span></div>`;
      }))
      .show();
  }

  function showTimes(today) {
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
    answers.push({ t: 'Day of Month', v: '{bDay} / {bDayNamePri} / {bDayNameSec}'.filledWith(_di) });
    answers.push({ t: 'Month', v: '{bMonth} / {bMonthNamePri} / {bMonthNameSec}'.filledWith(_di) });
    answers.push({ t: 'Day of Week', v: '{bWeekday} / {bWeekdayNamePri} / {bWeekdayNameSec} / {currentWeekdayShort}'.filledWith(_di) });

    showAnswers('#day-data', answers);

    answers = [];

    if (now.isAfter(sunset1)) {
      // eve of day1 into day2
      answers.push({ t: `Day started at sunset:`, v: sunset1.format(readableFormat) });

      var sun2 = sunCalc.getTimes(tomorrowNoon, latitude, longitude);
      var sunrise2 = moment(sun2.sunrise);
      var sunset2 = moment(sun2.sunset);

      if (now.isBefore(sunrise2)) {
        answers.push({ t: `Now:`, v: now.format(readableFormat) });
        answers.push({ t: `Sunrise:`, v: sunrise2.format(readableFormat) });
      } else {
        answers.push({ t: `Sunrise:`, v: sunrise2.format(readableFormat) });
        answers.push({ t: `Now:`, v: now.format(readableFormat) });
      }
      answers.push({ t: `Day will end at sunset:`, v: sunset2.format(readableFormat) });
    } else {
      // get prior sunset
      var sun0 = sunCalc.getTimes(moment(noon).subtract(24, 'hours'), latitude, longitude);
      var sunset0 = moment(sun0.sunset);

      answers.push({ t: `Day started at sunset:`, v: sunset0.format(readableFormat) });
      if (now.isBefore(sunrise1)) {
        answers.push({ t: `Now:`, v: now.format(readableFormat) });
        answers.push({ t: `Sunrise:`, v: sunrise1.format(readableFormat) });
      } else {
        answers.push({ t: `Sunrise:`, v: sunrise1.format(readableFormat) });
        answers.push({ t: `Now:`, v: now.format(readableFormat) });
      }
      answers.push({ t: `Day will end at sunset:`, v: sunset1.format(readableFormat) });
    }


    showAnswers('#times-data', answers);

    answers = [];
    answers.push({ v: latitude, t: 'Latitude', c: 'where' });
    answers.push({ v: longitude, t: 'Longitude', c: 'where' });

    showAnswers('#where-data', answers);
  }


  function onPause() {
    // TODO: This application has been suspended. Save application state here.
  }

  function onResume() {
    // TODO: This application has been reactivated. Restore application state here.
    // update the time!
  }
})();