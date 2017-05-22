'use strict';

exports.__esModule = true;
exports.default = Connector;

var _shallowEqual = require('../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _wrapActionCreators = require('../utils/wrapActionCreators');

var _wrapActionCreators2 = _interopRequireDefault(_wrapActionCreators);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultMapStateToTarget = function defaultMapStateToTarget() {
  return {};
};
var defaultMapDispatchToTarget = function defaultMapDispatchToTarget(dispatch) {
  return { dispatch: dispatch };
};

function Connector(store) {
  return function (mapStateToTarget, mapDispatchToTarget) {

    var finalMapStateToTarget = mapStateToTarget || defaultMapStateToTarget;

    var finalMapDispatchToTarget = (0, _isPlainObject2.default)(mapDispatchToTarget) ? (0, _wrapActionCreators2.default)(mapDispatchToTarget) : mapDispatchToTarget || defaultMapDispatchToTarget;

    (0, _invariant2.default)((0, _isFunction2.default)(finalMapStateToTarget), 'mapStateToTarget must be a Function. Instead received %s.', finalMapStateToTarget);

    (0, _invariant2.default)((0, _isPlainObject2.default)(finalMapDispatchToTarget) || (0, _isFunction2.default)(finalMapDispatchToTarget), 'mapDispatchToTarget must be a plain Object or a Function. Instead received %s.', finalMapDispatchToTarget);

    var slice = getStateSlice(store.getState(), finalMapStateToTarget, false);
    var isFactory = (0, _isFunction2.default)(slice);

    if (isFactory) {
      finalMapStateToTarget = slice;
      slice = getStateSlice(store.getState(), finalMapStateToTarget);
    }

    var boundActionCreators = finalMapDispatchToTarget(store.dispatch);

    return function (target) {

      (0, _invariant2.default)((0, _isFunction2.default)(target) || (0, _isObject2.default)(target), 'The target parameter passed to connect must be a Function or a object.');

      //Initial update
      updateTarget(target, slice, boundActionCreators);

      var unsubscribe = store.subscribe(function () {
        var nextSlice = getStateSlice(store.getState(), finalMapStateToTarget);
        if (!(0, _shallowEqual2.default)(slice, nextSlice)) {
          slice = nextSlice;
          updateTarget(target, slice, boundActionCreators);
        }
      });
      return unsubscribe;
    };
  };
}

function updateTarget(target, StateSlice, dispatch) {
  if ((0, _isFunction2.default)(target)) {
    target(StateSlice, dispatch);
  } else {
    Object.assign(target, StateSlice, dispatch);
  }
}

function getStateSlice(state, mapStateToScope) {
  var shouldReturnObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var slice = mapStateToScope(state);

  if (shouldReturnObject) {
    (0, _invariant2.default)((0, _isPlainObject2.default)(slice), '`mapStateToScope` must return an object. Instead received %s.', slice);
  } else {
    (0, _invariant2.default)((0, _isPlainObject2.default)(slice) || (0, _isFunction2.default)(slice), '`mapStateToScope` must return an object or a function. Instead received %s.', slice);
  }

  return slice;
}