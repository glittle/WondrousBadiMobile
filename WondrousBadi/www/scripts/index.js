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

    sharedStartup();

    //$('#get-times-btn').click(getWeatherWithZipCode);

    navigator.geolocation.getCurrentPosition(onGetLocationSuccess, onGetLocationError,
      { enableHighAccuracy: false });
    $('#error-msg').show();
    $('#error-msg').text('Determining your current location ...');
  }

  function onGetLocationSuccess(position) {
    //Retrieve the location information from the position object
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    var readableFormat = 'MMMM D [at] HH:mm';
    var answers = [];

    var now = moment();
    var noon = moment().hour(12).minute(0).second(0);
    var tomorrowNoon = moment(noon).add(24, 'hours');

    var sun1 = sunCalc.getTimes(noon, latitude, longitude);
    var sunrise1 = moment(sun1.sunrise);
    var sunset1 = moment(sun1.sunset);

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

    $('#times-data')
      .append($.map(answers, function (ans, i) {
        return `<li><strong>${ans.t}</strong> <span>${ans.v}</span></li>`;
      }))
      .show();
  }

  function onGetLocationError(error) {
    $('#error-msg').text('Error getting location');
    $('#get-times-btn').prop('disabled', false);
  }



  function onPause() {
    // TODO: This application has been suspended. Save application state here.
  }

  function onResume() {
    // TODO: This application has been reactivated. Restore application state here.
    // update the time!
  }
})();