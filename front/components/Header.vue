<template>
  <header class="bg-white shadow-md p-4">
    <div class="container mx-auto flex items-center justify-between">
      <!-- Logo -->
      <div class="text-lg font-bold text-gray-700">
        <a href="/" class="hover:text-blue-500">Trinity</a>
      </div>

      <!-- 导航菜单 (桌面端) -->

      <el-menu
          class="el-menu-demo"
          mode="horizontal"
      >
        <el-menu-item index="1"><a href="/about">Qui somme nous</a></el-menu-item>
        <el-menu-item index="1" v-if="!user"><a href="/login">Se connecter</a></el-menu-item>
        <el-sub-menu index="2" v-if="user?.role === 'buyer'">
          <template #title>{{ user.email }}</template>
          <el-menu-item index="2-1" @click="go_route('/user/profile')">Profile</el-menu-item>
          <el-menu-item index="2-2" @click="go_route('/commandes')">Commandes</el-menu-item>
          <el-menu-item index="2-3" @click="go_route('/factures')">Factures</el-menu-item>
          <el-menu-item index="2-4" @click="logout()">Se déconnecter</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2" v-else>
          <template #title>{{ user?.email }}</template>
          <el-menu-item index="2-1" @click="go_route('/admin')" v-if="user?.role === 'admin'">Tableau de bord</el-menu-item>
          <el-menu-item index="2-1" @click="go_route('/seller')" v-if="user?.role === 'seller'">Ma boutique</el-menu-item>
          <el-menu-item index="2-4" @click="logout()">Se déconnecter</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="3"><a href="/contact">Contact</a></el-menu-item>
      </el-menu>

      <!-- 移动端菜单按钮 -->
      <button
          @click="toggleMenu"
          class="block md:hidden text-gray-700 hover:text-blue-500 focus:outline-none"
      >
        <i class="el-icon-menu"></i>
      </button>

      <!-- 移动端菜单 -->
      <el-menu
          v-if="showMenu"
          class="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden"
          mode="vertical"
          background-color="#ffffff"
          text-color="#4b5563"
          active-text-color="#3b82f6"
      >
        <el-menu-item index="/about">
          <a href="/about" class="block hover:text-blue-500">À propos</a>
        </el-menu-item>
        <el-menu-item v-if="!user" index="/login">
          <a href="/login" class="block hover:text-blue-500">Connexion</a>
        </el-menu-item>
        <el-sub-menu v-else :index="'mobile-user-menu'">
          <template #title>
            <div class="flex items-center space-x-2">
              <i class="el-icon-user text-blue-500"></i>
              <span>{{ user.email }}</span>
            </div>
          </template>
          <el-menu-item index="/profile">
            <a href="/profile">Profil</a>
          </el-menu-item>
          <el-menu-item index="/orders">
            <a href="/orders">Commandes</a>
          </el-menu-item>
          <el-menu-item index="/invoices">
            <a href="/invoices">Factures</a>
          </el-menu-item>
          <el-menu-item index="/logout" @click="logout">
            Déconnexion
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const user = useUserStore().user;

// 路由路径，用于高亮菜单项
const router = useRouter();
const currentPath = ref('/');

// 获取当前路由，用于默认高亮
onMounted(() => {
  currentPath.value = router.currentRoute.value.path;
});

// 控制移动端菜单是否显示
const showMenu = ref(false);
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const go_route = (path) => {
  window.location.href = path;
}

// 退出登录方法
const logout = () => {
  const userStores = useUserStore();
  userStores.logout();
  window.location.href = '/';
};
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
}
</style>