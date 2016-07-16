/* jshint undef: true, unused: true */
/*global angular */
(function() {
    'use strict';

    angular.module('todoStorage', [])

    /**
     * Services that persists and retrieves TODOs from localStorage
     */
    .factory('todoStorage', function() {

        return {
            get: function(storage) {
                return JSON.parse(localStorage.getItem(storage) || '[]');
            },

            put: function(storage, todos) {
                localStorage.setItem(storage, JSON.stringify(todos));
            }
        };
    });
})();
