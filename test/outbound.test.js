/* eslint-disable prefer-arrow-callback, func-names, comma-dangle,
 no-unused-expressions, no-unused-vars, no-underscore-dangle */
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const redisClient = require('./../src/config/redis');

const should = chai.should();

chai.use(chaiHttp);

describe('testing /outbound/sms', function () {
  // --- HOOKS ----------------------------------------------------------------------- //
  // runs before all the tests in this block
  before(function (done) {
    // A little delay so the DB connection is established and startServer() is called.
    setTimeout(function () {
      // Create global variable for storing some temp data.
      global.testData = {
        user1: {
          basicAuth: 'Basic cGxpdm8xOjIwUzBLUE5PSU0=',
          username: 'plivo1'
        },
        incomingStopRequest: {
          from: '4924195509197',
          to: '4924195509198',
          text: 'STOP',
        },
        generalRequest: {
          from: '4924195509197',
          to: '4924195509198',
          text: 'Some text here',
        },
      };
      redisClient.flushdb((err, success) => {
        if (success) {
          console.info('Cache cleared');
        }
        done();
      });
    }, 1000);
  });
  // Before each test
  /* beforeEach(function (done) {

      done();
  }); */

  // runs after all tests in this block
  after(function (done) {
    // --- Clear global variables --- //
    global.tests = undefined;
    done();
  });

  // --- PREREQUISITES ------------------------------------------------------------------ /
  describe('/POST /inbound/sms', function () {
    // Valid Requests ------------------------------------------------------------------ //
    it('[PREREQUISITE] it should create a STOP request for upcoming tests.', function (done) {
      chai.request(server)
        .post('/api/v1/inbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send(global.testData.incomingStopRequest)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message')
              .that.is.equal('inbound sms ok');
            res.body.should.have.property('error')
              .that.is.a('string');
            done();
          }
        });
    });
  });

  // --- TESTS -------------------------------------------------------------------------- /
  describe('/POST /outbound/sms', function () {
    // Valid Requests ------------------------------------------------------------------ //
    it('it should allow outbound sms when all params are correct.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send(global.testData.generalRequest)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message')
              .that.is.equal('outbound sms ok');
            res.body.should.have.property('error')
              .that.is.a('string');
            done();
          }
        });
    });
    // Invalid Requests ---------------------------------------------------------------- //
    it('it should NOT authenticate a non-existent user (unknown username and password combo).', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('username', 'idonotexist')
        .set('password', 'madeuppassword')
        .send(global.testData.generalRequest)
        .end(function (err, res) {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.equal('INVALID_CREDENTIALS');
          done();
        });
    });

    it('it should NOT authenticate a user with wrong password.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('username', global.testData.user1.username)
        .set('password', 'madeuppassword')
        .send({
          from: '4924195509197',
          to: '4924195509198',
          text: 'Some text here'
        })
        .end(function (err, res) {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.equal('INVALID_CREDENTIALS');
          done();
        });
    });

    it('it should NOT authenticate when any authorization data is not provided.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .send({
          from: '4924195509197',
          to: '4924195509198',
          text: 'Some text here'
        })
        .end(function (err, res) {
          res.should.have.status(403);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.equal('NO_AUTH_FOUND');
          done();
        });
    });

    it('it should NOT allow invalid from param.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send({
          from: '492',
          to: '4924195509198',
          text: 'Some text here'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.a('string');
          done();
        });
    });

    it('it should NOT allow invalid to param.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send({
          from: '4924195509197',
          to: '4',
          text: 'Some text here'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.a('string');
          done();
        });
    });

    it('it should NOT allow invalid text param.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send({
          from: '4924195509197',
          to: '4924195509197',
          text: ''
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.a('string');
          done();
        });
    });

    it('it should NOT allow if the ‘from’ parameter is not present in the phone_number table for this specific account.', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send({
          from: '5924195509197',
          to: '4924195509197',
          text: 'Some text'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('error')
            .that.is.equal('from parameter not found');
          done();
        });
    });

    it('it should NOT allow if the pair ‘to’, ‘from’ matches any entry in cache (STOP).', function (done) {
      chai.request(server)
        .post('/api/v1/outbound/sms')
        .set('authorization', global.testData.user1.basicAuth)
        .send({
          from: global.testData.incomingStopRequest.to,
          to: global.testData.incomingStopRequest.from,
          text: 'Some text'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('error');
          res.body.error.should.have.string('blocked by STOP request');
          done();
        });
    });
  });

  describe('/GET /api/v1/outbound/sms', function () {
    it('it should not allow GET method.', function (done) {
      chai.request(server)
        .get('/api/v1/outbound/sms')
        .end(function (err, res) {
          res.should.have.status(405);
          done();
        });
    });
  });

  describe('/PUT /api/v1/outbound/sms', function () {
    it('it should not allow PUT method.', function (done) {
      chai.request(server)
        .put('/api/v1/outbound/sms')
        .end(function (err, res) {
          res.should.have.status(405);
          done();
        });
    });
  });
});
