cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-statusbar.statusbar",
    "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
    "pluginId": "cordova-plugin-statusbar",
    "clobbers": [
      "window.StatusBar"
    ]
  },
  {
    "id": "cordova-plugin-x-toast.Toast",
    "file": "plugins/cordova-plugin-x-toast/www/Toast.js",
    "pluginId": "cordova-plugin-x-toast",
    "clobbers": [
      "window.plugins.toast"
    ]
  },
  {
    "id": "cordova-plugin-otp-auto-verification.OTPAutoVerification",
    "file": "plugins/cordova-plugin-otp-auto-verification/www/OTPAutoVerification.js",
    "pluginId": "cordova-plugin-otp-auto-verification",
    "clobbers": [
      "OTPAutoVerification"
    ]
  },
  {
    "id": "cordova-plugin-CDVNavBar.NavBar",
    "file": "plugins/cordova-plugin-CDVNavBar/www/NavBar.js",
    "pluginId": "cordova-plugin-CDVNavBar",
    "clobbers": [
      "navbar"
    ]
  },
  {
    "id": "onesignal-cordova-plugin.OneSignal",
    "file": "plugins/onesignal-cordova-plugin/www/OneSignal.js",
    "pluginId": "onesignal-cordova-plugin",
    "clobbers": [
      "OneSignal"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-statusbar": "2.4.2",
  "cordova-plugin-x-toast": "2.7.2",
  "cordova-plugin-otp-auto-verification": "1.0.1",
  "cordova-plugin-CDVNavBar": "2.5.0",
  "onesignal-cordova-plugin": "2.4.6"
};
// BOTTOM OF METADATA
});