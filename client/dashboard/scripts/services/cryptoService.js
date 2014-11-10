'use_strict';

angular.module('dimsDashboard.services')
    .factory ('CryptoService', function($log) {
        
        return {

            encryptAES: function(message, key) {
                var result = CryptoJS.AES.encrypt(message, key).toString(CryptoJS.enc.Utf8);
                return CryptoJS.AES.encrypt(message, key).toString();
            },

            decryptAES: function(message, key) {
                return CryptoJS.AES.decrypt(message, key).toString(CryptoJS.enc.Utf8);
            },

        };
    });