This module exposes the
[geolocation API](https://developer.mozilla.org/en/using_geolocation)
to SDK-based add-ons.

It prompts the user for permission before using the API, and
returns either the position, if the user agreed, or an error
message if they did not.

As [recommended on MDN](https://developer.mozilla.org/en/using_geolocation#Prompting_for_permission),
the user is given four options:

* share, this time
* do not share, this time
* always share
* never share

If the user selects one of the last two options, the preference is
stored in `extensions.<addon-id>.allowGeolocation` where
`<addon-id>` is the calling add-on's ID, as read from
`require("self").id`, and the user is not prompted on subsequent
occasions.

It exports a single function `getCurrentPosition`, which takes a
callback, which will be called either with a `position` object or
with `null` if the user denied permission.

Usage:

<pre><code>
var geolocation = require("geolocation");

var widget = require("widget").Widget({
  id: "whereami",
  label: "Where am I?",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    geolocation.getCurrentPosition(function(position) {
      if (!position) {
        console.log("The user denied access to geolocation.");
      }
      else {
       console.log("latitude: ", position.coords.latitude);
       console.log("longitude: ", position.coords.longitude);
      }
    });
  }
});
</code></pre>

<api name="getCurrentPosition">
@function
Prompt the user for permission, and if they agree, get the current
position.

@param callback {function}
Callback function which will be called with the user's current position,
or `null` if the user denied permission.
</api>