var widgets = require("widget");
var activeBrowserWindow = require("window-utils").activeBrowserWindow;
var {Cc, Ci} = require("chrome");
var addonName = require("self").name;
var ACCESS_DENIED = "The user denied access";

function prompt(addonName, callback) {
  let pref = "extensions." + addonName + ".allowGeolocation";
  let message = addonName + " Add-on wants to know your location."
  let branch = Cc["@mozilla.org/preferences-service;1"]
               .getService(Ci.nsIPrefBranch2);
  if (branch.getPrefType(pref) === branch.PREF_STRING) {
    switch (branch.getCharPref(pref)) {
    case "always":
      return getCurrentPosition(callback);
    case "never":
      return callback(ACCESS_DENIED);
    }
  }
  let done = false;

  function remember(value, result) {
    return function () {
      done = true;
      branch.setCharPref(pref, value);
      if (result) {
        getCurrentPosition(callback);
      }
      else {
        callback(ACCESS_DENIED);
      }
    }
  }

  let self = activeBrowserWindow.PopupNotifications.show(activeBrowserWindow.gBrowser.selectedBrowser, "geolocation",
                        message, "geo-notification-icon",
    {
      label: "Share Location",
      accessKey: "S",
      callback: function (notification) {
        done = true;
        getCurrentPosition(callback);
      }
    }, [
      {
        label: "Always Share",
        accessKey: "A",
        callback: remember("always", true)
      },
      {
        label: "Never Share",
        accessKey: "N",
        callback: remember("never", false)
      }
    ], {
      eventCallback: function (event) {
        if (event === "dismissed") {
          if (!done)
            callback(ACCESS_DENIED);
          done = true;
          PopupNotifications.remove(self);
        }
      },
      persistWhileVisible: true
    });
}

function getCurrentPosition(callback) {
  var geolocation = Cc["@mozilla.org/geolocation;1"]
                      .getService(Components.interfaces.nsIDOMGeoGeolocation);
  geolocation.getCurrentPosition(callback);
}

function getCurrentPositionWithCheck(callback) {
  prompt(addonName, callback);
}

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    getCurrentPositionWithCheck(function(position) {
      if (position == ACCESS_DENIED) {
        console.log("THe user denied access to geolocation");
      }
      else {
       console.log("latitude: ", position.coords.latitude);
       console.log("longitude: ", position.coords.longitude);
      }
    });
  }
});
