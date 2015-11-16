'use-strict';
var frisby = require('frisby');
frisby.create('GET JSON from attribute api')
  .get('http://localhost:3000/api/attributes')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .toss();

