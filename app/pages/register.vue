<template>
  <div class="auth-page">
    <van-nav-bar title="注册" left-arrow @click-left="navigateTo('/login')" />
    <div class="auth-body">
      <van-cell-group inset>
        <van-field v-model="email" label="邮箱" placeholder="用于登录" clearable />
        <van-field v-model="username" label="用户名" placeholder="昵称/登录名" clearable />
        <van-field v-model="password" type="password" label="密码" placeholder="至少 8 位" />
        <van-field v-model="confirm" type="password" label="确认密码" placeholder="再次输入密码" />
      </van-cell-group>
      <van-button type="primary" block round class="auth-btn" :loading="loading" @click="onSubmit">
        注册并登录
      </van-button>
      <div class="auth-alt">已有账号？<span @click="toLogin">去登录</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
definePageMeta({ layout: 'blank' })
const route = useRoute()
const { register } = useAuth()
const email = ref('')
const username = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)

function redirectTarget() {
  const r = route.query.redirect
  return typeof r === 'string' && r ? r : '/user'
}
async function onSubmit() {
  if (!email.value || !password.value) { showToast('请填写邮箱和密码'); return }
  if (password.value.length < 8) { showToast('密码至少 8 位'); return }
  if (password.value !== confirm.value) { showToast('两次密码不一致'); return }
  loading.value = true
  try {
    await register(email.value, username.value || email.value.split('@')[0], password.value)
    showToast('注册成功')
    navigateTo(redirectTarget())
  } catch (e: any) {
    showToast(e?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
function toLogin() {
  navigateTo(`/login?redirect=${encodeURIComponent(redirectTarget())}`)
}
</script>

<style scoped>
.auth-page { min-height: 100vh; background: var(--color-bg-page); }
.auth-body { padding: 20px 12px; }
.auth-btn { margin-top: 24px; }
.auth-alt { margin-top: 16px; text-align: center; color: var(--color-text-secondary); font-size: 14px; }
.auth-alt span { color: var(--color-primary); }
</style>
