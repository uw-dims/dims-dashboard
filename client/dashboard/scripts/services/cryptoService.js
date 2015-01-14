'use_strict';

// File client/dashboard/scripts/services/cryptoService.js

(function() {

    var CryptoService = function($log) {
        
        var factory = {
            encryptAES: function(message, key) {
                var result = CryptoJS.AES.encrypt(message, key).toString(CryptoJS.enc.Utf8);
                return CryptoJS.AES.encrypt(message, key).toString();
            },

            decryptAES: function(message, key) {
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
