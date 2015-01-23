var chai = require('chai'),
    sinonChai = require('sinon-chai'),
    supertest = require('supertest');
    
global.expect = chai.expect;
global.sinon = require('sinon');
chai.use(sinonChai);
