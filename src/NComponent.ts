import Vue, { ComponentOptions } from 'vue';

// tslint:disable:no-any
// tslint:disable:function-name
// tslint:disable:typedef
// tslint:disable:no-invalid-this

export interface INComponentClass<T> {
  new(): NComponent<T>;
}

export abstract class NComponent<T> {

  protected fState: T;
  protected fVue: Vue;

}

interface IComponentContructorMetadata {
  template: string;
  methods: Record<string, any>;
  computed: Record<string, any>;
  props: Record<string, INPropParams>;
}

interface IVueExtInstance extends Vue {
  __instance: any;
}

function getMeta(target: any): IComponentContructorMetadata {
  if (!target.__meta) {
    target.__meta = {
      template: '',
      methods: {},
      props: {},
      computed: {},
    };
  }
  return target.__meta;
}

export function NTemplate(template: string) {
  return (target: any) => {
    getMeta(target).template = template;
    return target;
  };
}

export function NMethod() {
  return (classType: any, field: string, descriptor: PropertyDescriptor) => {
    const proto = classType.constructor;
    getMeta(proto).methods[field] = function (...args: any[]): any {
      return this.__instance[field].call(this.__instance, ...args);
    };
  };
}

export function NComputed() {
  return (target: any, field: string, descriptor?: PropertyDescriptor): any => {

    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      throw new Error('NComponent - attempt to use @NComputed to non setter/getter value.');
    }

    const proto = target.constructor;
    const meta = getMeta(proto);

    if (!meta.computed[field]) {
      meta.computed[field] = {};
    }

    if (descriptor.get !== undefined) {
      meta.computed[field].get = function () {
        return descriptor.get!.call(this.__instance);
      };
    }

    if (descriptor.set !== undefined) {
      meta.computed[field].set = function (newValue: any) {
        return descriptor.set!.call(this.__instance, newValue);
      };
    }

  };
}

interface INPropParams {
  type: any;
  required?: boolean;
  default?: any;
}

export function NProp(params: INPropParams) {
  return (target: any, field: string, descriptor?: PropertyDescriptor): any => {
    const proto = target.constructor;
    getMeta(proto).props[field] = params;
    Object.defineProperty(target, field, {
      get() {
        return this.fVue.$props[field];
      },
      set() {
        throw new Error('NComponent error - attempt to set property value.');
      },
    });
  };
}

export function createVueComponent<T>(classType: INComponentClass<T>): ComponentOptions<any> {

  const meta: IComponentContructorMetadata = (classType as any).__meta;

  const vueOptions = {

    name: classType.name,

    template: meta.template,

    beforeCreate(this: IVueExtInstance) {
      this.__instance = new classType();
      this.__instance.fVue = this;
    },

    data(this: IVueExtInstance) {
      return { state: this.__instance.fState };
    },

    methods: meta.methods,
    props: meta.props,
    computed: meta.computed,

  };

  return vueOptions;

}
