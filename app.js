/*jshint node: true, esnext: true*/
'use strict';

const url = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const NodeRSA = require('node-rsa');
const Q = require('q');

const app = express();
const requestq = Q.nfbind(request);
const log = (log) => console.log(`${new Date().toISOString()} | ${log}`);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.post('/api/v1/ping', (req, res) => {
  requestq({method: 'GET', baseUrl: req.body.api_url, uri: '/v1/ping'})
    .spread((result, body) => res.status(result.statusCode).send(body))
    .catch(err => res.status(500).send(err));
});

app.post('/api/', (req, res) => {
  const key = new NodeRSA(req.body.priv_key);
  const method = req.body.method;
  const body = method === 'POST' ? req.body.body : undefined;
  const urlObject = url.parse(req.body.api_url + req.body.uri);
  const data = `${urlObject.hostname}\n${urlObject.path}\n${body || ''}`;
  const signature = key.sign(data, 'base64', 'utf8');

  log(`API REQUEST: ${urlObject.href}`);
  requestq({
    method,
    uri: urlObject.href,
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'x-valuto-sign': signature,
      'x-valuto-api-id': req.body.api_id
    }
  })
    .spread((result, body) => res.status(result.statusCode).send(body))
    .catch(err => res.status(500).send(err));
});

const server = app.listen(3000, () => {
  const host = server.address().family === 'IPv6'
    ? `[${server.address().address}]`
    : server.address().address;
  const port = server.address().port;
  log(`Valuto.com API DEMO listening at http://${host}:${port}`);
});
