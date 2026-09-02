import { Lazyload } from 'vant'

// van-image 全站用了 lazy-load 属性，但缺这个插件注册会导致图片永远卡在 loading 占位，不会真正发起加载。
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Lazyload)
})
