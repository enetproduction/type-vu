import Vue, { ComponentOptions } from 'vue';

// tslint:disable:no-any
// tslint:disable:function-name
// tslint:disable:typedef
// tslint:disable:no-invalid-this

export interface INComponentClass<P, S> {
  new(): ComponentClass<P, S>;
}

export abstract class ComponentClass<P, S> {

  protected abstract $state: S;
  protected fVue: Vue;

  protected get $props(): P {
    return (this.fVue.$props as P);
  }

}

interface IVueExtInstance extends Vue {
  __instance: any;
}

function getMeta(target: any): ComponentOptions<any> {
  if (!target.__meta) {
    target.__meta = {};
  }
  return target.__meta;
}

function mergeMeta(target: any, newMeta: ComponentOptions<any>) {
  target.__meta = {
    ...target.__meta,
    ...newMeta,
  };
}

export function Component(options: ComponentOptions<any>) {
  return (target: any) => {
    mergeMeta(target, options);
    return target;
  };
}

interface INPropParams {
  type: any;
  required?: boolean;
  default?: any;
}

export function Prop(params: INPropParams) {
  return (target: any, field: string): any => {
    const proto = target.constructor;
    const meta = getMeta(proto);
    meta.props = meta.props || {};
    (meta.props as any)[field] = params;
  };
}

export const $internalHooks = [
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
  'errorCaptured', // 2.5
  'serverPrefetch', // 2.6
];

function extractMethodsAndProperties(proto: any): any {
  const options: any = {};

  Object.getOwnPropertyNames(proto).forEach((key) => {

    if (key === 'constructor') {
      return;
    }

    // hooks
    if (key[0] === '$') {
      const internalHook = key.slice(1);
      if ($internalHooks.indexOf(internalHook) > -1) {
        options[internalHook] = function(this: any, ...args: any[]) {
          return proto[key].call(this.__instance, ...args);
        }
        return;
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;
    if (descriptor.value !== void 0) {
      // methods
      if (typeof descriptor.value === 'function') {
        const method = function (this: any, ...args: any[]) {
          return descriptor.value.call(this.__instance, ...args);
        };
        (options.methods || (options.methods = {}))[key] = method;
      } else {
        // typescript decorated data
        (options.mixins || (options.mixins = [])).push({
          data (this: Vue) {
            return { [key]: descriptor.value };
          },
        });
      }
    } else if (descriptor.get || descriptor.set) {
      // computed properties

      options.computed = options.computed || {};

      if (descriptor.get !== undefined) {
        options.computed[key] = options.computed[key] || {};
        options.computed[key].get = function (this: any) {
          return descriptor.get!.call(this.__instance);
        };
      }

      if (descriptor.set !== undefined) {
        options.computed[key] = options.computed[key] || {};
        options.computed[key].set = function (this: any, value: any) {
          descriptor.set!.call(this.__instance, value);
        };
      }

    }
  });

  return options;
}

export function createVueComponent<P, S>(classType: INComponentClass<P, S>): ComponentOptions<any> {

  const meta: ComponentOptions<any> = (classType as any).__meta;
  const proto = classType.prototype;

  const options: any = {

    beforeCreate(this: IVueExtInstance) {
      this.__instance = new classType();
      this.__instance.fVue = this;
      if (typeof this.__instance.beforeCreate === 'function') {
        this.__instance.beforeCreate();
      }
    },

    data(this: IVueExtInstance) {
      return this.__instance.$state;
    },

    ...meta,

  };

  return {
    ...options,
    ...extractMethodsAndProperties(proto),
  };

}
