'use strict';

angular.module('demo-app', ['LocalStorageModule'])
  .controller('DemoAppCtrl', function($scope, $http, $q, $parse, $window, localStorageService) {

    $scope.resetAndReload = function() {
      localStorageService.clearAll();
      $window.location.reload();
    };

    bind('data.api_url', 'https://api.valuto.com');
    bind('data.broker_id');
    bind('data.priv_key');

    $scope.submitPing = function() {
      send('/api/ping')
    };

    $scope.submitVerify = function() {
      send('/api', {method: 'POST', uri: '/verify', body: '{"test": "OK"}'});
    };

    bind('showOperations', false);

    bind('registration.url', 'https://user.valuto.com/#/broker-registration');
    bind('registration.firstname', 'Stefan');
    bind('registration.lastname', 'Tester');
    bind('registration.company_name', 'PHU Stefan Tester');
    bind('registration.email');
    bind('registration.tax_id', '7792200000');
    bind('registration.phone', '+48508620221');
    bind('registration.street', 'Testing Str. 1234');
    bind('registration.postal_code', '61-123');
    bind('registration.city', 'Poznań');
    bind('registration.region', 'pl');
    $scope.registration.redirectUrl = function() {
      return ['firstname', 'lastname', 'company_name', 'email', 'tax_id', 'phone', 'street', 'postal_code', 'city',
        'region'].reduce(
        function(url, key) {
          return url + '&' + key + '=' + encodeURIComponent($scope.registration[key])
        }, $scope.registration.url + '?broker_id=' + $scope.data.broker_id);
    };

    bind('payment', JSON.stringify({
      "request_id": "1",
      "valuto_id": "WX20000043WX",
      "payment": {
        "amount": "100.00 PLN",
        "title": "some title",
        "destination": {
          "type": "IBAN",
          "owner_name": "Some Company",
          "owner_address": "Address Str. 1234, CityName",
          "iban": "PL81723116442358135293889265"
        }
      }
    }, undefined, 3/* 3 spaces indent */));

    $scope.submitPayment = function() {
      send('/api', {method: 'POST', uri: '/payment', body: $scope.payment});
    };

    bind('fetch.next_id', '');
    $scope.fetch = {
      status: '',
      response: [],
      timeoutDefer: undefined,
      in_progress: false
    };

    $scope.startFetching = function() {
      if ($scope.fetch.in_progress) return;
      $scope.fetch.status = "Pending...";
      $scope.fetch.in_progress = true;
      $scope.fetch.timeoutDefer = $q.defer();
      $scope.fetch.response = [];
      fetchData();

      function fetchData() {
        send('/api', {
          method: 'GET',
          uri: '/fetch' + ( $scope.fetch.next_id ? '?last_id=' + $scope.fetch.next_id : '')
        }, $scope.fetch.timeoutDefer.promise)
          .then(R.path(['data']))
          .then(function(data) {
            if (data.length > 0) {
              data.forEach(e => $scope.fetch.response.push(e));
              $scope.fetch.next_id = R.path(['_id'], R.last(data));
            }
            $scope.fetch.status = 'Last check: ' + new Date().toISOString();
            $scope.fetch.in_progress && fetchData();
          }, function(err) {
            $scope.stopFetching();
          });
      }
    };

    $scope.stopFetching = function() {
      if (!$scope.fetch.in_progress) return;
      $scope.fetch.in_progress = false;
      $scope.fetch.timeoutDefer.resolve();
    };

    function send(url, data, timeoutPromise) {
      var promise = $http.post(url, R.merge($scope.data, data), {timeout: timeoutPromise || 4000});
      if (!timeoutPromise) promise = promise.then(popup, popup);
      return promise;

      function popup(response) {
        var text = angular.isString(response.data)
          ? response.data
          : JSON.stringify(response.data, undefined, '   ');
        alert(response.status + '\n' + text);
      }
    }

    function bind(key, def) {
      return localStorageService.bind($scope, key, def);
    }
  });
