'use strict';

angular.module('demo-app', [])
  .controller('DemoAppCtrl', function ($scope, $http) {

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
