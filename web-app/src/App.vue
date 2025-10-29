<script setup>
import { onMounted, ref } from 'vue';

const users = ref({})

onMounted(async () => {
  const response = await fetch('/api/users');
  users.value = await response.json();
  console.log(users.value);
  
})
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>

  <!-- 测试获取后端数据 -->
  <div v-for="user of users" :key="user.id">Name: {{ user.name }}, Email: {{ user.email }}</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
