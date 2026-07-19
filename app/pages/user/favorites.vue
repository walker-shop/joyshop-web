<template>
  <div class="lux fav-page">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('user.myFavorites') }}</span>
    </header>

    <div class="lux-scroll">
      <!-- 空态 -->
      <div v-if="!loading && list.length === 0" class="lux-empty">
        <div class="lux-empty-ico">🤍</div>
        <div class="lux-empty-txt">{{ $t('user.favEmpty') }}</div>
        <button class="lux-btn fav-go" @click="navigateTo('/')">{{ $t('user.favGoShop') }}</button>
      </div>

      <!-- 收藏商品网格 -->
      <div v-else class="fav-grid">
        <div v-for="g in list" :key="g.id" class="fav-card" @click="navigateTo(`/goods/${g.id}`)">
          <div class="fav-thumb">
            <img v-if="g.images" :src="g.images" :alt="g.name">
            <span v-else class="fav-ph">{{ $t('order.noImage') }}</span>
            <button class="fav-heart" :aria-label="$t('user.favRemove')" :disabled="busy" @click.stop="onRemove(g)">
              <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.8-10-9.3C.6 8.9 2 5.5 5.2 5.5c1.8 0 3.1 1 3.8 2.1.7-1.1 2-2.1 3.8-2.1 3.2 0 4.6 3.4 3.2 6.2C19.5 16.2 12 21 12 21z" /></svg>
            </button>
          </div>
          <div class="fav-body">
            <div class="fav-name">{{ g.name }}</div>
            <div class="lux-price fav-price"><i>¥</i>{{ Number(g.shopPrice || 0).toFixed(2) }}</div>
          </div>
          <span class="lux-edge" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
const { t } = useI18n()
interface FavGoods { id:number; name:string; shopPrice:number; goodsBrief:string; images:string }
const { apiFetch } = useApi()
const { remove: removeFav } = useFav()
const list = ref<FavGoods[]>([])
const loading = ref(false)
const busy = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await apiFetch<{ total:number; data:FavGoods[]|null }>('/v1/userop/fav')
    list.value = res.data || []
  } catch (e:any) { showToast(e?.data?.msg || e?.message || t('user.favActionFailed')) }
  finally { loading.value = false }
}
onMounted(load)

async function onRemove(g: FavGoods) {
  if (busy.value) return
  busy.value = true
  try {
    await removeFav(g.id)
    list.value = list.value.filter(x => x.id !== g.id)
    showToast(t('user.favRemoved'))
  } catch (e:any) { showToast(e?.data?.msg || e?.message || t('user.favActionFailed')) }
  finally { busy.value = false }
}
</script>

<style scoped>
.fav-page { padding-bottom: 0; }
.fav-go { min-width: 148px; height: 46px; margin-top: 20px; }

.fav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.fav-card {
  position: relative; overflow: hidden; cursor: pointer;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair); border-radius: 16px;
  transition: transform .12s ease, border-color .12s ease;
}
.fav-card:active { transform: scale(.99); }
.fav-thumb { position: relative; width: 100%; aspect-ratio: 1/1; background: var(--lux-thumb-bg); display: grid; place-items: center; }
.fav-thumb img { width: 100%; height: 100%; object-fit: cover; }
.fav-ph { font-size: 12px; color: var(--lux-text-3); }
.fav-heart {
  position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 50%;
  display: grid; place-items: center; border: none;
  background: rgba(20, 12, 6, .42); backdrop-filter: blur(4px);
}
.fav-heart svg { width: 19px; height: 19px; fill: var(--lux-gold); }
.fav-heart:active { transform: scale(.9); }
.fav-heart:disabled { opacity: .6; }
.fav-body { padding: 10px 12px 13px; }
.fav-name {
  font-size: 13px; line-height: 1.45; color: var(--lux-text);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px;
}
.fav-price { font-size: 17px; margin-top: 6px; }
</style>
