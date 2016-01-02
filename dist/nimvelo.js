'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var extend = require('deep-extend');

var Stream = require('./stream');
var Customer = require('./customer');
var CustomerList = require('./customerList');
var Phonebookentry = require('./phonebookentry');
var Recording = require('./recording');

// Promise + callback polyfill
Promise.prototype.nodeify = require('./polyfills/nodeify'); // eslint-disable-line no-extend-native

// Package version
var VERSION = require('../package.json').version;

var Nimvelo = (function () {
  function Nimvelo(options) {
    _classCallCheck(this, Nimvelo);

    this.VERSION = VERSION;

    if (typeof options !== 'undefined') {

      if (options.hasOwnProperty('username') && options.hasOwnProperty('password')) {

        // If we've got the credentials then encode and format them
        var encodedAuth = new Buffer(options.username + ':' + options.password).toString('base64');

        this.authorization = 'Basic ' + encodedAuth;
      }
    }

    // Merge the default options with the client submitted options
    this.options = extend({
      username: null,
      password: null,
      customer: 'me',
      restBase: 'https://pbx.sipcentric.com/api/v1/customers/',
      streamBase: 'https://pbx.sipcentric.com/api/v1/stream',
      json: true,
      requestOptions: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.authorization,
          'User-Agent': 'node-nimvelo/' + VERSION
        }
      }
    }, options);

    // Build a request object
    this.request = request.defaults(extend(
    // Pass the client submitted request options
    this.options.requestOptions));

    this.customers = new CustomerList(this);
    this.stream = new Stream(this);
  }

  _createClass(Nimvelo, [{
    key: '_buildUrl',
    value: function _buildUrl(base, type, id) {

      // Build the url based on the base and the type

      var bases = {
        rest: this.options.restBase,
        stream: this.options.streamBase
      };

      // If we've been given a valid base, use it, else default to rest
      var baseUrl = bases.hasOwnProperty(base) ? bases[base] : bases.rest;
      var path = this._pathForType(type);

      if (type === 'customer' && !id) {
        if (!id) {
          // If there's no ID provided for a customer, use the default
          path = this.options.customer;
        }
      }

      // Let's build our URL
      var url = baseUrl;

      url += path ? path + '/' : '';
      url += id ? id + '/' : '';

      return url;
    }
  }, {
    key: '_pathForType',
    value: function _pathForType(type) {

      var path = '';
      var normalizedType = type.toLowerCase();

      switch (normalizedType) {
        case 'customers':
        case 'customer':
          // Use the default base REST URL
          break;
        case 'phonebookentry':
          path = this.options.customer + '/phonebook';
          break;
        case 'callbundle':
        case 'calls':
        case 'creditstatus':
        case 'endpoint':
        case 'outgoingcallerid':
        case 'phonenumber':
        case 'recording':
        case 'sms':
        case 'sound':
        case 'timeinterval':
          path = this.options.customer + '/' + normalizedType + 's';
          break;
        default:
          path = this.options.customer + '/' + normalizedType + 's';
          break;
      }

      return path;
    }
  }, {
    key: '_objectFromItem',
    value: function _objectFromItem(item) {

      if (typeof item === 'undefined' || !item.hasOwnProperty('type')) {
        return false;
      }

      var object = undefined;

      // Figure out which class to use for this type

      switch (item.type) {
        /* eslint no-use-before-define: 0 */
        case 'customer':
          object = new Customer(this, item);
          break;
        case 'phonebookentry':
          object = new Phonebookentry(this, item);
          break;
        case 'recording':
          object = new Recording(this, item);
          break;
        default:
          break;
      }

      return object;
    }
  }, {
    key: '_buildObjects',
    value: function _buildObjects(items) {
      var _this = this;

      // Builds an array of class objects from a given array of items,
      // or returns a single class object if we only give it one object

      return Array.isArray(items) ? items.map(function (item) {
        return _this._objectFromItem(item);
      }) : this._objectFromItem(items);
    }
  }, {
    key: '_request',
    value: function _request(method, resource) {
      var _this2 = this;

      var id = undefined;
      var params = undefined;
      var callback = undefined;

      var base = 'rest';
      var options = undefined;

      var normalizedMethod = method.toLowerCase();

      // Iterate through the given arguments assigning them accordingly
      // The ID is a string or a number
      // The object is the params
      // The function is the callback

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      args.forEach(function (arg) {

        switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
          case 'string':
          case 'number':
            id = arg;
            break;
          case 'object':
            params = arg;
            break;
          case 'function':
            callback = arg;
            break;
          default:
            break;
        }
      });

      // Build the options to pass to our custom request object

      if (normalizedMethod === 'get') {

        options = {
          method: 'get',
          url: this._buildUrl(base, resource, id), // Generate url
          qs: params
        };
      } else if (normalizedMethod === 'put') {

        // If we're PUTting, the params become the body

        options = {
          method: 'put',
          url: this._buildUrl(base, resource, id), // Generate url
          json: params
        };
      } else if (normalizedMethod === 'post') {

        // If we're POSTting, the params become the body

        options = {
          method: 'post',
          url: this._buildUrl(base, resource), // Generate url
          json: params
        };
      } else if (normalizedMethod === 'delete') {

        options = {
          method: 'delete',
          url: this._buildUrl(base, resource, id) // Generate url
        };
      }

      return new Promise(function (resolve, reject) {

        // Make the request

        _this2.request(options, function makeRequest(error, response, data) {

          if (error) {

            // If there's an error, reject
            reject(error);
          } else {

            var parsedData = undefined;

            if (data && typeof data === 'string') {

              try {

                // If we've got data, and it's a string, try to parse it as JSON
                parsedData = JSON.parse(data);
              } catch (parseError) {

                // If we can't parse it, reject

                reject(new Error('Error parsing JSON. Status Code: ' + response.statusCode));

                return;
              }
            } else {

              parsedData = data;
            }

            if (typeof parsedData.errors !== 'undefined') {

              // If there are some errors returned, reject

              reject(parsedData.errors);
            } else if (response.statusCode < 200 || response.statusCode >= 300) {

              // If we don't get the correct status back for the method, reject

              reject(new Error('Status Code: ' + response.statusCode));
            } else {

              // If we've got this far, then there are no errors and we can resolve

              resolve(parsedData);
            }
          }
        });
      }).nodeify(callback);
    }
  }, {
    key: '_getResource',
    value: function _getResource(type, id, callback) {
      var _this3 = this;

      if (typeof id === 'function') {
        /* eslint no-param-reassign:0 */

        // If we've not got an id then set it to null

        callback = id;
        id = null;
      }

      return new Promise(function (resolve, reject) {

        _this3._request('get', type, id).then(function (data) {

          resolve(_this3._buildObjects(data.items || data));
        }, function (error) {

          reject(error);
        });
      }).nodeify(callback);
    }
  }]);

  return Nimvelo;
})();

module.exports = Nimvelo;