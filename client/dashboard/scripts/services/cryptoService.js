'use strict';

// File client/dashboard/scripts/services/cryptoService.js

(function () {

  var CryptoService = function ($log) {

    var factory = {
      encryptAES: function (message, key) {
        // Encrypt the message - result is a cypherparams object
        var result = CryptoJS.AES.encrypt(message, key);
        // return the string represenation of the object - which is Base64 encoded
        return result.toString();
      },

      decryptAES: function (message, key) {
        return CryptoJS.AES.decrypt(message, key).toString(CryptoJS.enc.Utf8);
      }
    };

    return factory;
  };

  // Plug factory function into AngularJS
  angular.module('dimsDashboard.services')
      .factory('CryptoService', ['$log', CryptoService]);

}());

// EOF
