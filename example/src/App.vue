<template>
  <div>
    <input v-model="msg">
    <p>prop: {{ propMessage }}</p>
    <p>msg: {{ msg }}</p>
    <p>helloMsg: {{ helloMsg }}</p>
    <p>computed msg: {{ computedMsg }}</p>

    <Hello name="type-vu" />

    <p>
      Clicked: {{ count }} times
      <button @click="increment">+</button>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, createVueComponent, ComponentClass } from '../../lib/Component'
import Hello from './components/Hello.vue';

interface IProps {
  propMessage: string;
}

interface IState {
  count: number;
  msg: string;
}

@Component({
  name: 'App',
  components: {
    Hello,
  },
  props: {
    propMessage: {
      type: String,
      required: true,
    }
  },
})
export class App extends ComponentClass<IProps, IState> {

  public $state: IState = {
    count: 0,
    msg: 'something',
  };
  
  mounted () {}

  public get helloMsg(): string {
    return 'Hello, ' + this.$props.propMessage;
  }

  public get computedMsg () {
    return 'computed ' + this.$state.msg
  }

  public increment(): void {
    this.$state.count++;
  }
}

const AppInstance = createVueComponent(App);

export default AppInstance;
</script>