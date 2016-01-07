/* global describe, it, before, beforeEach */
/* eslint func-names:0 */

'use strict';

const assert = require('assert');
const nock = require('nock');
const qs = require('querystring');

const Nimvelo = require('../dist/nimvelo');

module.exports = function(testParams) {

  const objectType = testParams.objectType;
  const listObjectType = testParams.listObjectType;
  const listEndpoint = testParams.listEndpoint;

  describe(listObjectType, function() {

    let NvObject;
    let NvListObject;
    let mockData;
    let newListObject;

    before(function() {

      NvObject = require(`../dist/${objectType}`);
      NvListObject = require(`../dist/${listObjectType}`);
      mockData = require(`./mock/${objectType}`);
      newListObject = client => new NvListObject(client);

    });

    describe('Constructor', function() {

      describe(`new ${listObjectType}();`, function() {

        let client;
        let listObject;

        beforeEach(function() {
          client = new Nimvelo();
          listObject = newListObject(client);
        });

        it('creates new instance', function() {
          assert(listObject instanceof NvListObject);
        });

        it('has correct type', function() {
          assert.equal(listObject.type, listObjectType);
        });

        it('has correct item type', function() {
          assert.equal(listObject.itemType, objectType);
        });

        it('has access to client', function() {
          assert(listObject.client instanceof Nimvelo);
        });

        it('cannot have it\'s type overridden on initialization', function() {

          const listObjectWrongType = newListObject(client, {
            type: 'INCORRECT_TYPE'
          });

          assert.equal(
            listObjectWrongType.type,
            listObjectType
          );

        });

      });

    });

    describe('Inherited prototypes', function() {

      describe('prototype.list();', function() {

        let client;
        let listObject;

        let params;

        beforeEach(function() {

          client = new Nimvelo();
          listObject = newListObject(client);

          params = {
            createdAfter: '2016-01-01T00:00:00Z'
          };

        });

        it('method exists', function() {
          assert.equal(typeof listObject.list, 'function');
        });

        it('returns a promise by default', function() {
          assert(listObject.list() instanceof Promise);
        });

        it('doesn\'t return a promise if a callback is provided', function() {
          assert.notEqual(listObject.list(function() {}) instanceof Promise);
        });

        it('calls a callback, if provided', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);
          listObject.list(function(err, data) {
            if (err) {
              done(err);
            } else if (data.items[0].uri === mockData.listMultiple.items[0].uri) {
              done();
            } else {
              done(new Error('Name name doesn\'t match'));
            }
          });

        });

        it('returns an object containing items and metadata', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.list().then(function(data) {

            assert(data.hasOwnProperty('items'));

            assert(data.hasOwnProperty('meta'));

          }).then(done, done);

        });

        it(`returns an object with an items property containing an array of ${NvObject} objects`, function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.list().then(function(data) {

            assert(Array.isArray(data.items));
            assert(data.items[0] instanceof NvObject);
            assert(data.items[1] instanceof NvObject);

          }).then(done, done);

        });

        it('returns an object with a meta property containing metadata', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.list().then(function(data) {

            assert(data.hasOwnProperty('meta'));

            assert(data.meta.hasOwnProperty('totalItems'));
            assert.equal(data.meta.totalItems, 3);

            assert(data.meta.hasOwnProperty('pageSize'));
            assert.equal(data.meta.pageSize, 20);

            assert(data.meta.hasOwnProperty('page'));
            assert.equal(data.meta.page, 1);

          }).then(done, done);

        });

        it('appends given query parameters to request URL', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/?${qs.stringify(params)}`)
            .reply(200, mockData.listSingle);

          listObject.list(params).then(function(data) {

            assert.equal(data.items.length, 1);

            assert.equal(data.meta.totalItems, 1);

          }).then(done, done);

        });

      });

      describe('prototype.find();', function() {

        let client;
        let listObject;

        let params;

        beforeEach(function() {

          client = new Nimvelo();
          listObject = newListObject(client);

        });

        it('method exists', function() {
          assert.equal(typeof listObject.find, 'function');
        });

        it('returns a promise by default', function() {
          assert(listObject.find() instanceof Promise);
        });

        it('doesn\'t return a promise if a callback is provided', function() {
          assert.notEqual(listObject.find(function() {}) instanceof Promise);
        });

        it('calls a callback, if provided', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.find(function(err, data) {
            if (err) {
              done(err);
            } else if (data.items[0].uri === mockData.listMultiple.items[0].uri) {
              done();
            } else {
              done(new Error('Name name doesn\'t match'));
            }
          });

        });

        it('returns an object containing items and metadata if no id is provided', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.find().then(function(data) {

            assert(data.hasOwnProperty('items'));

            assert(data.hasOwnProperty('meta'));

          }).then(done, done);

        });

        it(`returns an object with an items property containing an array of ${NvObject} objects if no id is provided`, function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.find().then(function(data) {

            assert(Array.isArray(data.items));
            assert(data.items[0] instanceof NvObject);
            assert(data.items[1] instanceof NvObject);

          }).then(done, done);

        });

        it('returns an object with a meta property containing metadata if no id is provided', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/`)
            .query(true)
            .reply(200, mockData.listMultiple);

          listObject.find().then(function(data) {

            assert(data.hasOwnProperty('meta'));

            assert(data.meta.hasOwnProperty('totalItems'));
            assert.equal(data.meta.totalItems, 3);

            assert(data.meta.hasOwnProperty('pageSize'));
            assert.equal(data.meta.pageSize, 20);

            assert(data.meta.hasOwnProperty('page'));
            assert.equal(data.meta.page, 1);

          }).then(done, done);

        });

        it('returns a single object if id is provided', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/2/`)
            .query(true)
            .reply(200, mockData.singleObject);

          listObject.find(2).then(function(data) {

            assert(!Array.isArray(data));

            assert(!data.hasOwnProperty('items'));

            assert(!data.hasOwnProperty('meta'));

            assert.equal(data.uri, mockData.singleObject.uri);

          }).then(done, done);

        });

        it('appends given query parameters to request URL', function(done) {

          nock('https://pbx.sipcentric.com/api/v1/customers/me')
            .get(`/${listEndpoint}/${qs.stringify(params)}`)
            .query(params)
            .reply(200, mockData.listSingle);

          listObject.find(params).then(function(data) {

            assert.equal(data.items.length, 1);

            assert.equal(data.meta.totalItems, 1);

          }).then(done, done);

        });

      });

    });

  });

};