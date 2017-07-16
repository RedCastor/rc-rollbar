(function(angular){

  'use strict';

  //Create module rc rollbar
  var module = angular.module('rc-rollbar', []);

  module.config(['$provide', function($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', '$injector', '$window', function($delegate, $injector, $window) {
      return function (exception, cause) {
        if($window.Rollbar) {
          $window.Rollbar.error(exception, {cause: cause}, function(err, data) {
            var $rootScope = $injector.get('$rootScope');
            $rootScope.$emit('rollbar:exception', {
              exception: exception,
              err: err,
              data: data.result
            });
          });
        }
        $delegate(exception, cause);
      };
    }]);

    $provide.decorator('$log', ['$delegate', '$injector', '$window', function($delegate, $injector, $window) {

        if($window.Rollbar) {
            var originalError = $delegate.error;
            var originalWarn = $delegate.warn;

            $delegate.error = function decoratedError(msg) {
                $window.Rollbar.error('NG1: ' + msg, function(err, data) {
                    var $rootScope = $injector.get('$rootScope');
                    $rootScope.$emit('rollbar:log.error', {
                        exception: 'error',
                        err: err,
                        data: data.result
                    });
                });

                originalError.apply($delegate, arguments);
            };

            $delegate.warn = function decoratedWarn(msg) {
                $window.Rollbar.warning('NG1: ' + msg, function(err, data) {
                    var $rootScope = $injector.get('$rootScope');
                    $rootScope.$emit('rollbar:log.warn', {
                        exception: 'warning',
                        err: err,
                        data: data.result
                    });
                });

                originalWarn.apply($delegate, arguments);
            };
        }

        return $delegate;
    }]);
  }]);

  module.provider('Rollbar', function RollbarProvider() {
    var rollbarProvider = this;
    var rollbarActivated = true;

    this.init = function(config, script) {
      var _rollbarConfig = config;

      if (rollbarActivated) {
        if (angular.isUndefined(script) && !angular.isObject(script)) {
          script = {};
        }

        if (angular.isUndefined(script.version) || !script.version) {
          script.version = '2.1.0';
        }

        if (angular.isUndefined(script.source) || !script.source) {
            script.source = 'https://raw.githubusercontent.com/rollbar/rollbar.js/v' + script.version + '/dist/rollbar.snippet.js';
        }

        var $document =  angular.injector(['ng']).get('$document');
        var loadJS = function(src, onReady, location){
          var scriptTag = $document[0].createElement('script');
          scriptTag.src = src;
          scriptTag.onreadystatechange = onReady;
          location.appendChild(scriptTag);
        };

        var onReady = function(){

        };

        loadJS(script.source, onReady, $document[0].body);
      }
    };

    this.deinit = function () {
      rollbarActivated = false;
    };

    function getter($log, $window) {

      function _bindRollbarMethod(methodName) {
        return function() {
          $window.Rollbar[methodName].apply($window.Rollbar, arguments);
        };
      }

      function logInactiveMessage() {
        $log.warn("Rollbar is deactivated");
      }

      var service = {
        Rollbar: logInactiveMessage,

        configure: logInactiveMessage,

        critical: logInactiveMessage,
        error: logInactiveMessage,
        warning: logInactiveMessage,
        info: logInactiveMessage,
        debug: logInactiveMessage,

        scope: logInactiveMessage,

        verbose: logInactiveMessage,
        enable: logInactiveMessage,
        disable: logInactiveMessage
      };

      if (rollbarActivated) {
        service.Rollbar = $window.Rollbar;

        // bind the native Rollbar methods
        service.configure = _bindRollbarMethod('configure');
        service.critical = _bindRollbarMethod('critical');
        service.error = _bindRollbarMethod('error');
        service.warning = _bindRollbarMethod('warning');
        service.info = _bindRollbarMethod('info');
        service.debug = _bindRollbarMethod('debug');
        service.scope = _bindRollbarMethod('scope');

        service.verbose = function (boolean) {
          if (boolean === undefined) { boolean = true; }
          $window.Rollbar.configure({ verbose: boolean });
        };

        service.enable = function () {
          $window.Rollbar.configure({ enabled: true });
        };

        service.disable = function () {
          $window.Rollbar.configure({ enabled: false });
        };
      }

      return service;
    }

    getter.$inject = ['$log', '$window'];

    this.$get = getter;
  });

})
(angular);
