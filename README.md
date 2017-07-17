ng-rollbar
==========

[Rollbar](https://rollbar.com/) Angular wrapper for [Angular](https://angularjs.org/)


Installation
------------

You can use [bower](http://bower.io/) to install this frontend dependency: `bower install rc-rollbar --save`

Or you can just clone this repo: `git clone https://github.com/RedCastor/rc-rollbar`

Usage
-----

### Load

Add the library into your application:

Add the module as dependency to your angular app:

```javascript
angular.module('myApp', ['rc-rollbar', ...])
```

### Initialize

Now initialize the rollbar in your application's config:

```javascript
myApp.config(['RollbarProvider', function(RollbarProvider) {
  RollbarProvider.init({
    accessToken: "<YOUR-APPLICATION-TOKEN>",
    captureUncaught: true,
    payload: {
      environment: '<specify-your-env>'
    },
    rollbarJsUrl: '<OPTIONAL URL ROLLBAR JS MIN>',
    enableLogLevel: {
        error: true,
        warning: true,
        debug: false,
        info: false
    }
  });
}]);
```

What you pass in via this init is exactly what you would do via the `_rollbarConfig` variable as described in the [Rollbar Docs](https://rollbar.com/docs/notifier/rollbar.js/). This call to `init` will trigger the inclusion of the Rollbar snippet in your application. So if you never trigger the `init` call, Rollbar will never track anything.
Now every log method will be tracked by Rollbar.
By default method log info is disable.

### Do not load

If you are developing Apps which sometimes get deployed in an environment without
internet access (yes, theses places still exist) than you might want to disable
the whole loading process of rollbar:

```javascript
myApp.config(function(RollbarProvider) {
  RollbarProvider.deinit();
});
```

Now whenever you call a Rollbar function you will just get a log message and no
script will be loaded.

### Custom

If you need to manually trigger calls to Rollbar you can inject Rollbar where needed

```javascript
myApp.controller('MainCtrl', function($scope, Rollbar) {
  $scope.onSomeEvent = function() {
    Rollbar.error('this is an error with special handling');
  };
});
```

You can enable/disable Rollbar via:

```javascript
Rollbar.disable();
// ... things that should not be tracked by Rollbar ...
Rollbar.enable();
```

and you can turn on verbosity:

```javascript
Rollbar.verbose(); // will log infos to console
```

Other exposed api calls (see [Rollbar Docs](https://rollbar.com/docs/notifier/rollbar.js/) for further usage infos)

```javascript
// Rollbar severities
Rollbar.critical("some critical error");
Rollbar.error("some error");
Rollbar.warning("some warning");
Rollbar.info("some info");
Rollbar.debug("some debug message");

// Rollbar config
Rollbar.configure(<new-config>);

// Rollbar scope
Rollbar.scope();
```

And if anything is missing you can access the original Rollbar object via

```javascript
Rollbar.Rollbar // access original Rollbar instance
```

### Eventing & Callbacks

Since Angular 1.x decorators cannot specify order of execution, handling the results of the Rollbar request (such as fetching the UUID to hand-off to Customer Service) relies on the Angular eventing system. Whenever an exception is caught and handled by Rollbar, a `rollbar:exception` event will be emitted on `$rootScope`.

This provides easy access to the Rollbar API response:

```javascript
    angular.service('MyErrorListener', function($rootScope) {
        this.initialize = function() {   
            $rootScope.$on('rollbar:log:error', function(event, response) {
                // custom logic here...
            });
            
            $rootScope.$on('rollbar:log:warning', function(event, response) {
                // custom logic here...
            });
            
            $rootScope.$on('rollbar:log:info', function(event, response) {
                // custom logic here...
            });
            
            $rootScope.$on('rollbar:log:debug', function(event, response) {
                // custom logic here...
            });
        }
    });
```

The `event` parameter in the listener is the representation of the Angular event. The `response` object contains the following items:

* `exception` - The exception that was caught and logged to Rollbar
* `data` - The data sent back from Rollbar
* `err` - Error information if the Rollbar request failed

How it works
------------

The library decorates angulars `$log` with a call to `Rollbar.<METHOD>` with the catched message.

