(function () {
    'use strict';

    var backend = angular.module('mock.localBackend', ['ngMockE2E', 'ngResource', 'LocalStorageModule', 'mock.fixtures']);

    backend.constant('localStorageNamespace', 'mock');

    backend.config(['localStorageServiceProvider', 'localStorageNamespace', function (localStorageServiceProvider, localStorageNamespace) {
        localStorageServiceProvider.setPrefix(localStorageNamespace);
    }]);

    backend.run(['MockFixtures', 'LocalBackend', '$resource', '$httpBackend', 'localStorageService', 'localStorageNamespace', function (MockFixtures, LocalBackend, $resource, $httpBackend, localStorageService, localStorageNamespace) {
        localStorageService.clearAll();

        for (var i in MockFixtures) {
            LocalBackend.registerEndpoint(MockFixtures[i], i);
        }

        window.$resource = $resource;
        window.$httpBackend = $httpBackend;
    }]);

    backend.service('LocalBackend', ['$httpBackend', 'LocalEndpoint', function ($httpBackend, LocalEndpoint) {
        var deparam = function (url) {
            var queryString = url.replace(/.*?\?/, "");
            var keyValPairs = [];
            var params = {};

            if (queryString.length) {
                keyValPairs = queryString.split('&');
                for (var pairNum in keyValPairs) {
                    var key = keyValPairs[pairNum].split('=')[0];
                    if (!key.length) {
                        continue;
                    }
                    if (typeof params[key] === 'undefined'){
                        params[key] = [];
                    }
                    params[key].push(keyValPairs[pairNum].split('=')[1]);
                }
            }
            return params;
        };

        var parsePrimaryKey = function (matcher, url) {
            var matches = matcher.exec(url);
            if (matches.length > 1) {
                return matches[1];
            } else {
                return null;
            }
        };

        var Backend = function () {
            this.endpoints = [];
        };

        Backend.prototype = {
            registerEndpoint: function (endpoint, key) {
                var localEndpoint = new LocalEndpoint(endpoint.methods, endpoint.data, endpoint.matcher, key, endpoint.primaryKey);

                $httpBackend.whenGET(endpoint.matcher).respond(function (method, url) {
                    var pk = parsePrimaryKey(localEndpoint.matcher, url),
                        params = deparam(url),
                        response = localEndpoint.read(pk, params);

                    return [200, angular.toJson(response), {}];
                });

                $httpBackend.whenPOST(endpoint.matcher).respond(function (method, url, data) {
                    var pk = parsePrimaryKey(localEndpoint.matcher, url);

                    if (pk) {
                        localEndpoint.update(angular.fromJson(data));
                    } else {
                        localEndpoint.create(angular.fromJson(data));
                    }

                    return [200, '', {}];
                });

                $httpBackend.whenDELETE(endpoint.matcher).respond(function (method, url, data) {
                    var pk = parsePrimaryKey(localEndpoint.matcher, url);
                    localEndpoint.delete(pk);
                    return [200, '', {}];
                });

                this.endpoints.push(endpoint);
            }
        };

        return new Backend();
    }]);

    backend.factory('LocalEndpoint', ['NotImplementedError', 'localStorageService', function (NotImplementedError, localStorageService) {
        var generatePrimaryKey = function () {
            return Math.floor(Math.random() * 10000);
        };

        var endpoint = function (methods, fixtures, matcher, key, primaryKey) {
            this.matcher = matcher;
            this.key = key;
            this.primaryKey = primaryKey || 'pk';

            var regex = new RegExp(methods);
            this.create = regex.test('CREATE') ? this._create : this._throwErrow;
            this.read = regex.test('READ') ? this._read : this._throwErrow;
            this.update = regex.test('UPDATE') ? this._update : this._throwErrow;
            this.delete = regex.test('DELETE') ? this._delete : this._throwErrow;

            this._data = [];

            for (var i = 0; i < fixtures.length; i++) {
                this._create(fixtures[i]);
            }
        };

        endpoint.prototype = {
            _create: function (entity) {
                var defaults = {};
                defaults[this.primaryKey] = generatePrimaryKey();
                angular.extend(entity, defaults);

                var data = localStorageService.get(this.key) || [];
                data.push(entity);

                return localStorageService.add(this.key, data);
            },
            _read: function (pk) {
                var data = localStorageService.get(this.key);

                if (pk) {
                    for (var i = 0; i < data.length; i++) {
                        if (pk == data[i][this.primaryKey]) {
                            return data[i];
                        }
                    }
                } else {
                    return data;
                }
            },
            _update: function (entity) {
                var data = localStorageService.get(this.key) || [];

                for (var i = 0; i < data.length; i++) {
                    if (data[i][this.primaryKey] == entity[this.primaryKey]) {
                        angular.extend(data[i], entity);
                        break;
                    }
                }

                return localStorageService.add(this.key, data);
            },
            _delete: function (pk) {
                var data = localStorageService.get(this.key) || [];

                for (var i = 0; i < data.length; i++) {
                    if (data[i][this.primaryKey] == pk) {
                        data.splice(i, 1);
                        break;
                    }
                }

                return localStorageService.add(this.key, data);
            },
            _throwErrow: function () {
                throw new NotImplementedError();
            }
        };

        return endpoint;
    }]);

    backend.factory('NotImplementedError', function () {
        var error = function (message) {
            this.name = 'NotImplemented';
            this.message = message || 'Method not implemented';
        };

        error.prototype = new Error();
        error.prototype.constructor = error;

        return error;
    });
}());