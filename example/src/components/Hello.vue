<template>
  <div>Hello, {{ name }}</div>
</template>

<script lang="ts">
import { Component, createVueComponent, ComponentClass } from '../../../lib/Component'

interface IProps {
  name: string;
}

interface IState {}

@Component({
  name: 'App',
  props: {
    name: {
      type: String,
      required: true,
    }
  },
})
export class Hello extends ComponentClass<IProps, IState> {

  public $state: IState = {};

}

const HelloInstance = createVueComponent(Hello);
export default HelloInstance;
</script>

