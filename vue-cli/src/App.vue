<template>
  <h1 class="title">App</h1>
  <el-button type="primary" @click="startClick">开始</el-button>
  <ul>
    <li>
      <router-link to="/home">Home</router-link>
    </li>
    <li>
      <router-link to="/about">About</router-link>
    </li>
  </ul>
  <router-view />
</template>

<script>
// Element Plus 使用按需引入时，组件需要手动按需引入，然后对应的 css 样式文件会自动按需引入
import { ElButton } from "element-plus";

export default {
  name: "App",
  methods: {
    startClick() {
      this.$router.push('/');
    },
  },
  components: {
    ElButton,
  },
};
</script>

<style>
  .title {
    color: black;
  }
</style>
