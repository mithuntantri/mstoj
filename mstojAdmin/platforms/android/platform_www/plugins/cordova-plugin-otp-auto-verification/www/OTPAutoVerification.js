cordova.define("cordova-plugin-otp-auto-verification.OTPAutoVerification", function(require, exports, module) {
var exec = require('cordova/exec');

module.exports = {
    startOTPListener: function (options, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "OTPAutoVerification", "startOTPListener", [options]);
    },
    stopOTPListener: function () {
        cordova.exec("OTPAutoVerification", "stopOTPListener");
    }

};
});
