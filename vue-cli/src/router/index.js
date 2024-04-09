import { createRouter, createWebHistory } from "vue-router";

// 1、使用按需加载
// 2、使用 "魔法注释" 自定义 chunk 的输出文件名称
const Welcome = () => import(/* webpackChunkName: 'welcome' */ '../views/Welcome');
const Home = () => import(/* webpackChunkName: 'home' */ '../views/Home');
const About = () => import(/* webpackChunkName: 'about' */ '../views/About');

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Welcome,
    },
    {
      path: '/home',
      component: Home,
    },
    {
      path: '/about',
      component: About,
    }
  ]
})
