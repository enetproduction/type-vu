/**
  * type-vu v1.3.0
  * (c) 2019-present ENP
  * @license MIT
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.TypeVu = {})));
}(this, (function (exports) { 'use strict';

    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var ComponentClass = /** @class */ (function () {
        function ComponentClass() {
        }
        Object.defineProperty(ComponentClass.prototype, "$props", {
            get: function () {
                return this.$vue.$props;
            },
            enumerable: true,
            configurable: true
        });
        return ComponentClass;
    }());
    function getMeta(target) {
        if (!target.__meta) {
            target.__meta = {};
        }
        return target.__meta;
    }
    function mergeMeta(target, newMeta) {
        target.__meta = __assign({}, target.__meta, newMeta);
    }
    function Component(options) {
        return function (target) {
            mergeMeta(target, options);
            return target;
        };
    }
    function Prop(params) {
        return function (target, field) {
            var proto = target.constructor;
            var meta = getMeta(proto);
            meta.props = meta.props || {};
            meta.props[field] = params;
        };
    }
    var $internalHooks = [
        'data',
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeDestroy',
        'destroyed',
        'beforeUpdate',
        'updated',
        'activated',
        'deactivated',
        'render',
        'errorCaptured',
        'serverPrefetch',
    ];
    function extractMethodsAndProperties(proto) {
        var options = {};
        Object.getOwnPropertyNames(proto).forEach(function (key) {
            if (key === 'constructor') {
                return;
            }
            // hooks
            if (key[0] === '$') {
                var internalHook = key.slice(1);
                if ($internalHooks.indexOf(internalHook) > -1) {
                    options[internalHook] = function () {
                        var _a;
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return (_a = proto[key]).call.apply(_a, [this.__instance].concat(args));
                    };
                    return;
                }
            }
            var descriptor = Object.getOwnPropertyDescriptor(proto, key);
            if (descriptor.value !== void 0) {
                // methods
                if (typeof descriptor.value === 'function') {
                    var method = function () {
                        var _a;
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return (_a = descriptor.value).call.apply(_a, [this.__instance].concat(args));
                    };
                    (options.methods || (options.methods = {}))[key] = method;
                }
                else {
                    // typescript decorated data
                    (options.mixins || (options.mixins = [])).push({
                        data: function () {
                            var _a;
                            return _a = {}, _a[key] = descriptor.value, _a;
                        },
                    });
                }
            }
            else if (descriptor.get || descriptor.set) {
                // computed properties
                options.computed = options.computed || {};
                if (descriptor.get !== undefined) {
                    options.computed[key] = options.computed[key] || {};
                    options.computed[key].get = function () {
                        return descriptor.get.call(this.__instance);
                    };
                }
                if (descriptor.set !== undefined) {
                    options.computed[key] = options.computed[key] || {};
                    options.computed[key].set = function (value) {
                        descriptor.set.call(this.__instance, value);
                    };
                }
            }
        });
        return options;
    }
    function collectData(instance) {
        var resultObject = {};
        var blacklist = [
            '$vue', '$state'
        ];
        Object.getOwnPropertyNames(instance)
            .filter(function (key) { return blacklist.indexOf(key) === -1; })
            .forEach(function (key) {
            var initialValue = instance[key];
            resultObject[key] = initialValue;
            Object.defineProperty(instance, key, {
                configurable: true,
                enumerable: true,
                get: function () { return resultObject[key]; },
                set: function (value) { return resultObject[key] = value; },
            });
        });
        return resultObject;
    }
    function createVueComponent(classType) {
        var meta = classType.__meta;
        var proto = classType.prototype;
        var dataObject;
        var options = __assign({ beforeCreate: function () {
                this.__instance = new classType();
                this.__instance.$vue = this;
                dataObject = collectData(this.__instance);
                if (typeof this.__instance.beforeCreate === 'function') {
                    this.__instance.beforeCreate();
                }
            },
            data: function () {
                return dataObject;
            } }, meta);
        return __assign({}, options, extractMethodsAndProperties(proto));
    }

    exports.ComponentClass = ComponentClass;
    exports.Component = Component;
    exports.Prop = Prop;
    exports.$internalHooks = $internalHooks;
    exports.createVueComponent = createVueComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
