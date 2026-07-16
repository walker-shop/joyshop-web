<template>
  <div class="auth-page">
    <van-nav-bar title="登录" left-arrow @click-left="navigateTo('/user')" />
    <div class="auth-body">
      <van-cell-group inset>
        <van-field v-model="account" label="账号" placeholder="用户名或邮箱" clearable />
        <van-field v-model="password" type="password" label="密码" placeholder="请输入密码" />
      </van-cell-group>
      <van-button type="primary" block round class="auth-btn" :loading="loading" @click="onSubmit">
        登录
      </van-button>
      <div class="auth-alt">还没有账号？<span @click="toRegister">去注册</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
definePageMeta({ layout: 'blank' })
const route = useRoute()
const { login } = useAuth()
const account = ref('')
const password = ref('')
const loading = ref(false)

function redirectTarget() {
  const r = route.query.redirect
  return typeof r === 'string' && r ? r : '/user'
}
async function onSubmit() {
  if (!account.value || !password.value) { showToast('请输入账号和密码'); return }
  loading.value = true
  try {
    await login(account.value, password.value)
    showToast('登录成功')
    navigateTo(redirectTarget())
  } catch (e: any) {
    showToast(e?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
function toRegister() {
  navigateTo(`/register?redirect=${encodeURIComponent(redirectTarget())}`)
}
</script>

<style scoped>
.auth-page { min-height: 100vh; background: var(--color-bg-page); }
.auth-body { padding: 20px 12px; }
.auth-btn { margin-top: 24px; }
.auth-alt { margin-top: 16px; text-align: center; color: var(--color-text-secondary); font-size: 14px; }
.auth-alt span { color: var(--color-primary); }
</style>
