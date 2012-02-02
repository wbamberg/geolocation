var activeBrowserWindow = require("window-utils").activeBrowserWindow;
var {Cc, Ci} = require("chrome");
var ACCESS_DENIED = "The user denied access";

// Ask the user to confirm that they want to share their location.
// If they agree, call the geolocation function, passing the in the
// callback. Otherwise, call the callback with an error message.
function getCurrentPositionWithCheck(callback) {
  var addonName = require("self").name;
  var addonId = require("self").id;
  let pref = "extensions." + addonId + ".allowGeolocation";
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

  let self = activeBrowserWindow.PopupNotifications.show(
               activeBrowserWindow.gBrowser.selectedBrowser,
               "geolocation",
               message,
               "geo-notification-icon",
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

// Implement getCurrentPosition by loading the nsIDOMGeoGeolocation
// XPCOM object.
function getCurrentPosition(callback) {
  var geolocation = Cc["@mozilla.org/geolocation;1"]
                      .getService(Ci.nsIDOMGeoGeolocation);
  geolocation.getCurrentPosition(callback);
}

exports.getCurrentPosition = getCurrentPositionWithCheck;
exports.userDenied = ACCESS_DENIED;