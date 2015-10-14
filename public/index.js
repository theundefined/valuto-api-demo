'use strict';

angular.module('demo-app', [])
  .controller('DemoAppCtrl', function ($scope, $http, $q) {

    $scope.data = {
      api_url: 'https://api.valuto.com',
      broker_id: '',
      priv_key: undefined
    };

    $scope.submitPing = function() {
      send('/api/ping')
    };

    $scope.submitVerify = function() {
      send('/api', {method: 'POST', uri: '/verify', body: '{"test": "OK"}'});
    };


    $scope.payment = JSON.stringify({
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
      next_id: undefined,
      response: '',
      timeout: /*Promise*/undefined,
      in_progress: false
    };

    $scope.startFetching = function() {
      if ($scope.fetch.in_progress) return;
      $scope.fetch.in_progress = true;
      $scope.fetch.timeout = $q.defer().then(function() {$scope.fetch.in_progress = false});
      $scope.fetch.response = '';
      while ($scope.fetch.in_progress) {
        // TODO: fetch data from server and append
        // TODO: use timeout promise to abort fetching
      }
    };

    $scope.stopFetching = function() {
      $scope.fetch.timeout && $scope.fetch.timeout.resolve();
    };

    function send(url, data) {
      return $http.post(url, R.merge($scope.data, data), {timeout: 4000}).then(popup, popup);

      function popup(response) {
        var text = angular.isString(response.data)
          ? response.data
          : JSON.stringify(response.data, undefined, '   ');
        alert(response.status + '\n' + text);
      }
    }
  });
