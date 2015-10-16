'use strict';

angular.module('demo-app', ['LocalStorageModule'])
  .controller('DemoAppCtrl', function($scope, $http, $q, localStorageService) {

    $scope.store = localStorageService;

    $scope.data = {
      api_url: $scope.store.get('api_url') || 'https://api.valuto.com',
      broker_id: $scope.store.get('broker_id') || '',
      priv_key: $scope.store.get('priv_key') || null
    };

    $scope.registration = {
      url: $scope.store.get('registration_url') || 'https://valuto.com/pl/pl/registration-broker.html#/',
      firstname: $scope.store.get('firstname') || 'Stefan',
      lastname: $scope.store.get('lastname') || 'Tester',
      company: $scope.store.get('company') || 'PHU Stefan Tester',
      email: $scope.store.get('email') || 'tester+api1@c1.org.pl',
      tax_id: $scope.store.get('tax_id') || '7792200000',
      phone: $scope.store.get('phone') || '+48508620221',
      region: $scope.store.get('pl') || 'pl',
      redirectUrl: function() {
        return ['firstname', 'lastname', 'company', 'email', 'tax_id', 'phone', 'region'].reduce(
          function(url, key) {
            return url + '&' + key + '=' + encodeURIComponent($scope.registration[key])
          }, $scope.registration.url + '?broker_id=' + $scope.data.broker_id);
      }
    };

    $scope.submitPing = function() {
      send('/api/ping')
    };

    $scope.submitVerify = function() {
      send('/api', {method: 'POST', uri: '/verify', body: '{"test": "OK"}'});
    };

    $scope.payment = $scope.store.get('payment') || JSON.stringify({
      "request_id": "1",
      "valuto_id": "WX20000043WX",
      "payment": {
        "amount": "100.00 PLN",
        "title": "some title",
        "recipient": {
          "type": "IBAN",
          "name": "Some Company",
          "address": "Address Str. 1234",
          "iban": "PL81723116442358135293889265"
        }
      }
    }, undefined, '   ');

    $scope.submitPayment = function() {
      send('/api', {method: 'POST', uri: '/payment', body: $scope.payment});
    };

    $scope.fetch = {
      status: '',
      next_id: $scope.store.get('next_id') || '',
      response: [],
      timeoutDefer: undefined,
      timeout: /*Promise*/undefined,
      in_progress: false
    };

    $scope.startFetching = function() {
      if ($scope.fetch.in_progress) return;
      $scope.fetch.status = "Pending...";
      $scope.fetch.in_progress = true;
      $scope.fetch.timeoutDefer = $q.defer();
      $scope.fetch.timeout = $scope.fetch.timeoutDefer.promise;
      $scope.fetch.timeoutDefer.promise
        .then(function() {
          $scope.fetch.in_progress = false
        });
      $scope.fetch.response = [];
      fetchData();
    };

    $scope.stopFetching = function() {
      $scope.fetch.timeout && $scope.fetch.timeoutDefer.resolve();
    };

    function fetchData() {
      send('/api', {
        method: 'GET',
        uri: '/fetch' + ( $scope.fetch.next_id ? '?last_id=' + $scope.fetch.next_id : '')
      }, $scope.fetch.timeout)
        .then(function(response) {
          response.data.forEach(e =>
            $scope.fetch.response.push(e));
          $scope.fetch.next_id = response.data.pop().id;
          $scope.store.set('next_id', $scope.fetch.next_id)
        })
        .finally(() => {
          $scope.fetch.status = 'Last check: ' + new Date().toISOString();
          $scope.fetch.in_progress && fetchData();
        });
    }

    function send(url, data, timeoutPromise) {
      var promise = $http.post(url, R.merge($scope.data, data), {timeout: timeoutPromise || 4000});
      if (!timeoutPromise)
        return promise.then(popup, popup);
      else
        return promise;

      function popup(response) {
        var text = angular.isString(response.data)
          ? response.data
          : JSON.stringify(response.data, undefined, '   ');
        alert(response.status + '\n' + text);
      }
    }
  });
