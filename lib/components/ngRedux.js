'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = ngReduxProvider;

var _connector = require('./connector');

var _connector2 = _interopRequireDefault(_connector);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _redux = require('redux');

var _digestMiddleware = require('./digestMiddleware');

var _digestMiddleware2 = _interopRequireDefault(_digestMiddleware);

var _curry = require('lodash/curry');

var _curry2 = _interopRequireDefault(_curry);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeIs = (0, _curry2.default)(function (type, val) {
  return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === type;
});
var isObject = typeIs('object');
var isString = typeIs('string');

function ngReduxProvider() {
  var _reducer = undefined;
  var _middlewares = undefined;
  var _storeEnhancers = undefined;
  var _initialState = undefined;
  var _reducerIsObject = undefined;

  this.createStoreWith = function (reducer, middlewares, storeEnhancers, initialState) {
    (0, _invariant2.default)((0, _isFunction2.default)(reducer) || isObject(reducer), 'The reducer parameter passed to createStoreWith must be a Function or an Object. Instead received %s.', typeof reducer === 'undefined' ? 'undefined' : _typeof(reducer));

    (0, _invariant2.default)(!storeEnhancers || Array.isArray(storeEnhancers), 'The storeEnhancers parameter passed to createStoreWith must be an Array. Instead received %s.', typeof storeEnhancers === 'undefined' ? 'undefined' : _typeof(storeEnhancers));

    _reducer = reducer;
    _reducerIsObject = isObject(reducer);
    _storeEnhancers = storeEnhancers;
    _middlewares = middlewares || [];
    _initialState = initialState;
  };

  this.$get = function ($injector) {
    var resolveMiddleware = function resolveMiddleware(middleware) {
      return isString(middleware) ? $injector.get(middleware) : middleware;
    };

    var resolvedMiddleware = (0, _map2.default)(_middlewares, resolveMiddleware);

    var resolveStoreEnhancer = function resolveStoreEnhancer(storeEnhancer) {
      return isString(storeEnhancer) ? $injector.get(storeEnhancer) : storeEnhancer;
    };

    var resolvedStoreEnhancer = (0, _map2.default)(_storeEnhancers, resolveStoreEnhancer);

    if (_reducerIsObject) {
      var getReducerKey = function getReducerKey(key) {
        return isString(_reducer[key]) ? $injector.get(_reducer[key]) : _reducer[key];
      };

      var resolveReducerKey = function resolveReducerKey(result, key) {
        var _Object$assign;

        return Object.assign({}, result, (_Object$assign = {}, _Object$assign[key] = getReducerKey(key), _Object$assign));
      };

      var reducersObj = Object.keys(_reducer).reduce(resolveReducerKey, {});

      _reducer = (0, _redux.combineReducers)(reducersObj);
    }

    var finalCreateStore = resolvedStoreEnhancer ? _redux.compose.apply(undefined, resolvedStoreEnhancer)(_redux.createStore) : _redux.createStore;

    //digestMiddleware needs to be the last one.
    resolvedMiddleware.push((0, _digestMiddleware2.default)($injector.get('$rootScope')));

    var store = _initialState ? _redux.applyMiddleware.apply(undefined, resolvedMiddleware)(finalCreateStore)(_reducer, _initialState) : _redux.applyMiddleware.apply(undefined, resolvedMiddleware)(finalCreateStore)(_reducer);

    return Object.assign({}, store, { connect: (0, _connector2.default)(store) });
  };

  this.$get.$inject = ['$injector'];
}