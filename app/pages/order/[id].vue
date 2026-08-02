<template>
  <div class="lux">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/order')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('order.detailTitle') }}</span>
    </header>

    <template v-if="detail">
      <div class="lux-scroll">
        <!-- 状态 hero -->
        <section
          class="od-hero"
          :class="{
            'is-amber': orderStatusTone(detail.order_info.status) === 'amber',
            'is-muted': orderStatusTone(detail.order_info.status) === 'muted',
            'is-dim': orderStatusTone(detail.order_info.status) === 'dim',
          }"
        >
          <span class="od-hero-dot" />
          <div class="od-hero-status">{{ orderStatusKey(detail.order_info.status) ? $t(orderStatusKey(detail.order_info.status)) : detail.order_info.status }}</div>
          <div class="od-hero-sn">{{ $t('order.orderNo') }} {{ detail.order_info.order_sn }}</div>
        </section>

        <!-- 收货信息 -->
        <section class="lux-card od-addr">
          <div class="od-addr-pin">
            <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
          </div>
          <div class="od-addr-body">
            <div class="od-name">{{ detail.order_info.name }}<span class="od-tel">{{ detail.order_info.mobile }}</span></div>
            <div class="od-detail">{{ detail.order_info.address }}</div>
          </div>
          <span class="lux-edge" />
        </section>

        <!-- 送达信息 -->
        <section v-if="['SHIPPED','TRADE_FINISHED'].includes(detail.order_info.status) && detail.order_info.tracking_no" class="lux-card od-delivery">
          <h3 class="od-delivery-title">{{ $t('order.deliveryInfo') }}</h3>
          <div class="od-delivery-row">
            <span>{{ $t('order.shippingCompany') }}</span>
            <span>{{ detail.order_info.express_company }}</span>
          </div>
          <div class="od-delivery-row">
            <span>{{ $t('order.trackingNumber') }}</span>
            <span>{{ detail.order_info.tracking_no }}</span>
          </div>
          <div class="od-delivery-row">
            <span>{{ $t('order.shippedAt') }}</span>
            <span>{{ detail.order_info.shipped_at }}</span>
          </div>
        </section>

        <!-- 退货被拒通知 -->
        <section v-if="detail.order_info.status === 'TRADE_FINISHED' && detail.order_info.return_reject_reason" class="lux-card od-return-notice">
          {{ $t('order.returnRejectedNotice', { reason: detail.order_info.return_reject_reason }) }}
        </section>

        <!-- 退货信息 -->
        <section v-if="detail.order_info.return_reason" class="lux-card od-delivery">
          <h3 class="od-delivery-title">{{ $t('order.returnInfo') }}</h3>
          <div class="od-delivery-row">
            <span>{{ $t('order.returnReasonLabel') }}</span>
            <span>{{ returnReasonText(detail.order_info.return_reason) }}</span>
          </div>
          <div v-if="detail.order_info.return_reason_note" class="od-delivery-row">
            <span>{{ $t('order.returnReasonNoteLabel') }}</span>
            <span>{{ detail.order_info.return_reason_note }}</span>
          </div>
          <template v-if="detail.order_info.status === 'RETURN_REQUESTED'">
            <div class="od-delivery-row"><span>{{ $t('order.returnRequestedNotice') }}</span></div>
          </template>
          <template v-if="detail.order_info.return_express_company">
            <div class="od-delivery-row">
              <span>{{ $t('order.returnExpressCompanyLabel') }}</span>
              <span>{{ detail.order_info.return_express_company }}</span>
            </div>
            <div class="od-delivery-row">
              <span>{{ $t('order.returnTrackingNoLabel') }}</span>
              <span>{{ detail.order_info.return_tracking_no }}</span>
            </div>
          </template>
          <template v-if="detail.order_info.status === 'RETURN_SHIPPED'">
            <div class="od-delivery-row"><span>{{ $t('order.returnShippedNotice') }}</span></div>
          </template>
        </section>

        <!-- 商品 -->
        <section class="lux-card od-goods">
          <div v-for="(g, i) in detail.goods" :key="i" class="od-item">
            <div class="od-thumb">
              <img v-if="g.goods_image" :src="g.goods_image" :alt="g.goods_name">
              <span v-else class="od-thumb-ph">{{ $t('order.noImage') }}</span>
            </div>
            <div class="od-item-main">
              <div class="od-item-name">{{ g.goods_name }}</div>
              <div class="od-item-row">
                <span class="lux-price od-price"><i>¥</i>{{ g.goods_price?.toFixed(2) }}</span>
                <span class="od-qty">×{{ g.nums }}</span>
              </div>
              <div v-if="isFinished" class="od-review-line">
                <span v-if="reviewedIds.includes(g.goods_id)" class="od-reviewed">{{ $t('review.reviewed') }}</span>
                <button v-else class="od-review-btn" @click="openReview(g)">{{ $t('review.writeReview') }}</button>
              </div>
            </div>
          </div>

          <div class="od-sum">
            <span class="od-sum-label">{{ $t('order.actualPaid') }}</span>
            <span class="lux-price od-total"><i>¥</i>{{ detail.order_info.total?.toFixed(2) }}</span>
          </div>
        </section>
      </div>

      <!-- 动作条 -->
      <div v-if="barActions.length" class="lux-bar od-bar">
        <div v-if="isUnpaid" class="od-bar-info">
          <span class="od-bar-label">{{ $t('order.due') }}</span>
          <span class="lux-price od-bar-price"><i>¥</i>{{ detail.order_info.total?.toFixed(2) }}</span>
        </div>
        <div class="od-bar-btns">
          <button v-if="barActions.includes('cancel')" class="lux-btn-ghost od-act-btn" :disabled="acting" @click="onCancel">{{ $t('order.cancelOrder') }}</button>
          <button v-if="barActions.includes('delete')" class="lux-btn-ghost od-act-btn" :disabled="acting" @click="onDelete">{{ $t('order.deleteOrder') }}</button>
          <button v-if="barActions.includes('confirmReceipt')" class="lux-btn od-act-btn" :disabled="acting" @click="onConfirm">{{ $t('order.confirmReceipt') }}</button>
          <button v-if="barActions.includes('requestReturn')" class="lux-btn-ghost od-act-btn" @click="openReturnRequest">{{ $t('order.requestReturn') }}</button>
          <button v-if="barActions.includes('submitReturnShipping')" class="lux-btn od-act-btn" @click="openReturnShipping">{{ $t('order.submitReturnShipping') }}</button>
          <button v-if="barActions.includes('pay')" class="lux-btn od-pay-btn" :disabled="paying" @click="doPay">
            <span v-if="!paying">{{ $t('order.payNow') }}</span>
            <span v-else class="lux-spin" />
          </button>
        </div>
      </div>
    </template>

    <!-- 评价弹窗 -->
    <div v-if="reviewModal.open" class="rv-mask" @click.self="closeReview">
      <div class="rv-sheet">
        <div class="rv-title">{{ $t('review.title') }}</div>
        <div class="rv-goods">{{ reviewModal.goodsName }}</div>
        <div class="rv-stars">
          <button
            v-for="n in 5"
            :key="n"
            class="rv-star"
            :class="{ on: n <= reviewModal.rating }"
            :aria-label="`${n} star`"
            @click="reviewModal.rating = n"
          >★</button>
        </div>
        <textarea
          v-model="reviewModal.content"
          class="rv-textarea"
          :placeholder="$t('review.placeholder')"
          maxlength="500"
          rows="4"
        />
        <div class="rv-upload">
          <div v-if="reviewModal.previews.length" class="rv-preview-list">
            <div v-for="(src, index) in reviewModal.previews" :key="src" class="rv-preview">
              <img :src="src" alt="">
              <button :aria-label="$t('common.delete')" @click="removeReviewImage(index)">×</button>
            </div>
          </div>
          <input ref="reviewFileInput" class="rv-file" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="onReviewFiles">
          <button v-if="reviewModal.files.length < 5" class="rv-add-photo" @click="reviewFileInput?.click()">＋ {{ $t('review.addPhotos') }}</button>
          <span>{{ $t('review.photoHint') }}</span>
        </div>
        <div class="rv-actions">
          <button class="lux-btn-ghost rv-btn" @click="closeReview">{{ $t('common.cancel') }}</button>
          <button class="lux-btn rv-btn" :disabled="submitting" @click="submitReviewForm">{{ $t('review.submit') }}</button>
        </div>
      </div>
    </div>

    <!-- 申请退货弹窗 -->
    <div v-if="returnRequestModal.open" class="rv-mask" @click.self="closeReturnRequest">
      <div class="rv-sheet">
        <div class="rv-title">{{ $t('order.requestReturnTitle') }}</div>
        <div class="rr-field">
          <label class="rr-label">{{ $t('order.returnReasonLabel') }}</label>
          <select v-model="returnRequestModal.reason" class="rr-select">
            <option value="" disabled>{{ $t('order.returnReasonPlaceholder') }}</option>
            <option value="QUALITY">{{ $t('order.returnReasonQuality') }}</option>
            <option value="MISDESCRIBED">{{ $t('order.returnReasonMisdescribed') }}</option>
            <option value="WRONG_ITEM">{{ $t('order.returnReasonWrongItem') }}</option>
            <option value="NO_LONGER_WANTED">{{ $t('order.returnReasonNoLongerWanted') }}</option>
            <option value="OTHER">{{ $t('order.returnReasonOther') }}</option>
          </select>
        </div>
        <div class="rr-field">
          <label class="rr-label">{{ $t('order.returnReasonNoteLabel') }}</label>
          <textarea
            v-model="returnRequestModal.note"
            class="rv-textarea"
            :placeholder="$t('order.returnReasonNotePlaceholder')"
            maxlength="500"
            rows="3"
          />
        </div>
        <div class="rv-actions">
          <button class="lux-btn-ghost rv-btn" @click="closeReturnRequest">{{ $t('common.cancel') }}</button>
          <button class="lux-btn rv-btn" :disabled="returnSubmitting || !returnRequestModal.reason" @click="submitReturnRequestForm">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 寄回物流弹窗 -->
    <div v-if="returnShippingModal.open" class="rv-mask" @click.self="closeReturnShipping">
      <div class="rv-sheet">
        <div class="rv-title">{{ $t('order.submitReturnShippingTitle') }}</div>
        <div class="rr-field">
          <label class="rr-label">{{ $t('order.returnExpressCompanyLabel') }}</label>
          <input v-model="returnShippingModal.expressCompany" class="rr-input" :placeholder="$t('order.returnExpressCompanyPlaceholder')">
        </div>
        <div class="rr-field">
          <label class="rr-label">{{ $t('order.returnTrackingNoLabel') }}</label>
          <input v-model="returnShippingModal.trackingNo" class="rr-input" :placeholder="$t('order.returnTrackingNoPlaceholder')">
        </div>
        <div class="rv-actions">
          <button class="lux-btn-ghost rv-btn" @click="closeReturnShipping">{{ $t('common.cancel') }}</button>
          <button class="lux-btn rv-btn" :disabled="returnSubmitting || !returnShippingModal.expressCompany.trim() || !returnShippingModal.trackingNo.trim()" @click="submitReturnShippingForm">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
import { orderStatusKey, orderStatusTone } from '~/utils/orderStatus'
import { availableActions } from '~/utils/orderActions'
const { t } = useI18n()
interface Detail { order_info:{ id:number; order_sn:string; status:string; total:number; name:string; mobile:string; address:string; express_company?:string; tracking_no?:string; shipped_at?:string; return_reason?:string; return_reason_note?:string; return_reject_reason?:string; return_express_company?:string; return_tracking_no?:string }; goods:{ goods_id:number; goods_name:string; goods_image:string; goods_price:number; nums:number }[] }
const { apiFetch } = useApi()
const { pay } = usePayment()
const { busy: acting, cancel, confirmReceipt, remove } = useOrderActions()
const { submitReview, getReviewedGoodsIds } = useReviews()
const { upload: uploadReviewImage } = useReviewImageUpload()
const { requestReturn, submitReturnShipping } = useReturns()

function returnReasonText(reason: string): string {
  const map: Record<string, string> = {
    QUALITY: t('order.returnReasonQuality'),
    MISDESCRIBED: t('order.returnReasonMisdescribed'),
    WRONG_ITEM: t('order.returnReasonWrongItem'),
    NO_LONGER_WANTED: t('order.returnReasonNoLongerWanted'),
    OTHER: t('order.returnReasonOther'),
  }
  return map[reason] || reason
}

// 申请退货
const returnRequestModal = reactive({ open: false, reason: '', note: '' })
const returnSubmitting = ref(false)
function openReturnRequest() {
  returnRequestModal.open = true
  returnRequestModal.reason = ''
  returnRequestModal.note = ''
}
function closeReturnRequest() { returnRequestModal.open = false }
async function submitReturnRequestForm() {
  if (!detail.value || !returnRequestModal.reason) return
  returnSubmitting.value = true
  try {
    await requestReturn(detail.value.order_info.id, returnRequestModal.reason, returnRequestModal.note)
    showToast(t('order.requestReturnSuccess'))
    returnRequestModal.open = false
    await load()
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || t('order.actionFailed'))
  } finally {
    returnSubmitting.value = false
  }
}

// 提交寄回物流
const returnShippingModal = reactive({ open: false, expressCompany: '', trackingNo: '' })
function openReturnShipping() {
  returnShippingModal.open = true
  returnShippingModal.expressCompany = ''
  returnShippingModal.trackingNo = ''
}
function closeReturnShipping() { returnShippingModal.open = false }
async function submitReturnShippingForm() {
  if (!detail.value) return
  returnSubmitting.value = true
  try {
    await submitReturnShipping(detail.value.order_info.id, returnShippingModal.expressCompany.trim(), returnShippingModal.trackingNo.trim())
    showToast(t('order.submitReturnShippingSuccess'))
    returnShippingModal.open = false
    await load()
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || t('order.actionFailed'))
  } finally {
    returnSubmitting.value = false
  }
}

// 评价（仅已完成订单）
const reviewedIds = ref<number[]>([])
const isFinished = computed(() => detail.value?.order_info.status === 'TRADE_FINISHED')
const reviewModal = reactive<{ open: boolean; goodsId: number; goodsName: string; rating: number; content: string; files: File[]; previews: string[] }>({ open: false, goodsId: 0, goodsName: '', rating: 5, content: '', files: [], previews: [] })
const reviewFileInput = ref<HTMLInputElement | null>(null)
const submitting = ref(false)
function openReview(g: { goods_id: number; goods_name: string }) {
  reviewModal.open = true
  reviewModal.goodsId = g.goods_id
  reviewModal.goodsName = g.goods_name
  reviewModal.rating = 5
  reviewModal.content = ''
  clearReviewImages()
}
function clearReviewImages() { reviewModal.previews.forEach(URL.revokeObjectURL); reviewModal.files = []; reviewModal.previews = []; if (reviewFileInput.value) reviewFileInput.value.value = '' }
function closeReview() { reviewModal.open = false; clearReviewImages() }
function onReviewFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const next = Array.from(input.files || []).filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024).slice(0, 5 - reviewModal.files.length)
  reviewModal.files.push(...next); reviewModal.previews.push(...next.map(URL.createObjectURL)); input.value = ''
}
function removeReviewImage(index: number) { URL.revokeObjectURL(reviewModal.previews[index]!); reviewModal.files.splice(index, 1); reviewModal.previews.splice(index, 1) }
async function loadReviewStatus() {
  if (!detail.value || !isFinished.value) { reviewedIds.value = []; return }
  reviewedIds.value = await getReviewedGoodsIds(detail.value.order_info.id)
}
async function submitReviewForm() {
  if (submitting.value || !detail.value) return
  submitting.value = true
  try {
    const images = await Promise.all(reviewModal.files.map(uploadReviewImage))
    await submitReview({
      orderId: detail.value.order_info.id,
      goodsId: reviewModal.goodsId,
      rating: reviewModal.rating,
      content: reviewModal.content,
      images,
    })
    showToast(t('review.submitted'))
    closeReview()
    await loadReviewStatus()
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || (reviewModal.files.length ? t('review.uploadFailed') : t('review.submitFailed')))
  } finally {
    submitting.value = false
  }
}
// needShip 在响应顶层（与 data 同级，非嵌套在 data 内）——proto omitempty 会丢 false，顶层布尔不受影响
const needShip = ref(true)
const barActions = computed(() => detail.value ? availableActions(detail.value.order_info.status, needShip.value) : [])
async function onCancel() {
  if (detail.value && await cancel(detail.value.order_info.id)) await load()
}
async function onConfirm() {
  if (detail.value && await confirmReceipt(detail.value.order_info.id)) await load()
}
async function onDelete() {
  if (detail.value && await remove(detail.value.order_info.id)) navigateTo('/order')
}
const route = useRoute()
const detail = ref<Detail | null>(null)
const paying = ref(false)
const isUnpaid = computed(() => ['PAYING','WAIT_BUYER_PAY'].includes(detail.value?.order_info.status || ''))

async function load() {
  const res = await apiFetch<{ data: Detail; needShip?: boolean }>(`/v1/orders/${route.params.id}`)
  detail.value = res.data
  needShip.value = res.needShip ?? true
}
async function doPay() {
  if (!detail.value) return
  paying.value = true
  try {
    const r = await pay({ orderId: detail.value.order_info.id })
    // 'redirecting' 时页面即将跳转 Stripe 收银台；失败才提示
    if (r !== 'redirecting') { showToast(t('order.payFailed')); paying.value = false }
  } catch (e:any) { showToast(e?.message || t('order.payFailed')); paying.value = false }
}
// Stripe 回跳后轮询 webhook 入账结果（异步，稍等几秒）
async function pollPaid() {
  paying.value = true
  for (let i = 0; i < 10; i++) {
    await load()
    if (detail.value?.order_info.status === 'TRADE_SUCCESS') {
      showToast(t('order.paySuccess')); paying.value = false; return
    }
    await new Promise(r => setTimeout(r, 1500))
  }
  paying.value = false
  showToast(t('order.payIncomplete'))
}
onMounted(async () => {
  await load()
  await loadReviewStatus()
  if (route.query.paid === '1') { pollPaid(); return }
  if (route.query.pay === '1' && isUnpaid.value) doPay()
})
</script>

<style scoped>
/* ---- Status hero ---- */
.od-hero {
  position: relative; overflow: hidden;
  padding: 30px 22px 28px; margin-bottom: 14px; border-radius: 20px;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair);
}
.od-hero-dot {
  display: inline-block; width: 9px; height: 9px; border-radius: 50%;
  background: var(--lux-text-3); box-shadow: 0 0 0 4px rgba(255, 255, 255, .04);
  margin-bottom: 14px;
}
.od-hero-status { font-size: 27px; font-weight: 700; letter-spacing: 3px; color: var(--lux-text); line-height: 1; }
.od-hero-sn { margin-top: 12px; font-size: 12px; letter-spacing: .5px; color: var(--lux-text-3); font-variant-numeric: tabular-nums; }
/* status colour treatments */
.od-hero.is-amber {
  border-color: rgba(227, 186, 125, .38);
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(224, 190, 120, .16), transparent 60%),
    linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
}
.od-hero.is-amber .od-hero-dot { background: var(--lux-gold); box-shadow: 0 0 12px rgba(227, 186, 125, .8), 0 0 0 4px rgba(227, 186, 125, .12); }
.od-hero.is-amber .od-hero-status { color: var(--lux-gold); }
.od-hero.is-muted .od-hero-dot { background: var(--lux-text-2); box-shadow: 0 0 0 4px rgba(255, 255, 255, .05); }
.od-hero.is-muted .od-hero-status { color: var(--lux-text); }
.od-hero.is-dim .od-hero-status { color: var(--lux-text-2); }

/* ---- Address ---- */
.od-addr { position: relative; display: flex; align-items: center; gap: 14px; padding: 18px 16px; overflow: hidden; }
.od-addr-pin {
  flex: 0 0 42px; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;
  background: linear-gradient(140deg, var(--lux-accent-2), var(--lux-accent));
  box-shadow: 0 6px 16px rgba(224, 190, 120, .45);
}
.od-addr-pin svg { width: 23px; height: 23px; fill: #fff; }
.od-addr-body { flex: 1; min-width: 0; }
.od-name { font-size: 16px; font-weight: 600; color: var(--lux-text); display: flex; align-items: baseline; gap: 10px; }
.od-tel { font-size: 13px; font-weight: 400; color: var(--lux-text-2); letter-spacing: 1px; font-variant-numeric: tabular-nums; }
.od-detail { font-size: 13px; color: var(--lux-text-2); margin-top: 5px; line-height: 1.5; }

/* ---- Delivery info ---- */
.od-delivery { padding: 16px; }
.od-delivery-title { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--lux-text); }
.od-delivery-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; font-size: 13px; color: var(--lux-text-2); }
.od-delivery-row span:last-child { color: var(--lux-text); font-weight: 500; }

/* ---- Return rejected notice ---- */
.od-return-notice {
  padding: 14px 16px; font-size: 13px; line-height: 1.5; color: var(--lux-gold);
  border: 1px solid color-mix(in srgb, var(--lux-gold) 38%, transparent);
}

/* ---- Return request / shipping form fields ---- */
.rr-field { margin: 14px 0; text-align: left; }
.rr-label { display: block; font-size: 12.5px; color: var(--lux-text-2); margin-bottom: 6px; }
.rr-select,
.rr-input {
  width: 100%; box-sizing: border-box; border-radius: 12px; padding: 11px 12px;
  background: var(--lux-bg); border: 1px solid var(--lux-hair-soft); color: var(--lux-text); font-size: 14px;
}
.rr-select:focus,
.rr-input:focus { outline: none; border-color: var(--lux-gold); }

/* ---- Goods ---- */
.od-goods { padding: 4px 16px 16px; }
.od-item { display: flex; gap: 13px; padding: 15px 0; border-bottom: 1px solid var(--lux-hair-soft); }
.od-thumb {
  flex: 0 0 66px; width: 66px; height: 66px; border-radius: 14px; overflow: hidden;
  background: var(--lux-thumb-bg); border: 1px solid var(--lux-hair-soft); display: grid; place-items: center;
}
.od-thumb img { width: 100%; height: 100%; object-fit: cover; }
.od-thumb-ph { font-size: 11px; color: var(--lux-text-3); }
.od-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.od-item-name {
  font-size: 14px; font-weight: 500; color: var(--lux-text); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.od-item-row { margin-top: auto; padding-top: 8px; display: flex; align-items: baseline; justify-content: space-between; }
.od-price { font-size: 16px; }
.od-qty {
  font-size: 12px; color: var(--lux-text-2); font-variant-numeric: tabular-nums;
  background: var(--lux-chip-bg); border: 1px solid var(--lux-hair-soft); padding: 3px 10px; border-radius: 999px;
}

/* ---- Sum ---- */
.od-sum { display: flex; align-items: baseline; justify-content: flex-end; gap: 12px; padding: 16px 0 4px; }
.od-sum-label { font-size: 14px; color: var(--lux-text); font-weight: 500; }
.od-total { font-size: 22px; }

/* ---- Pay bar ---- */
.od-bar-info { flex: 1; display: flex; align-items: baseline; gap: 8px; }
.od-bar-label { font-size: 13px; color: var(--lux-text-2); }
.od-bar-price { font-size: 25px; line-height: 1; }
.od-pay-btn { flex: 0 0 auto; min-width: 148px; height: 50px; font-size: 16px; }
.od-bar-btns { flex: 1; display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.od-act-btn { flex: 0 0 auto; min-width: 116px; height: 50px; font-size: 15px; }

/* ---- 评价入口（商品项内） ---- */
.od-review-line { margin-top: 8px; display: flex; justify-content: flex-end; }
.od-review-btn {
  border: 1px solid color-mix(in srgb, var(--lux-gold) 46%, transparent); background: transparent; cursor: pointer;
  color: var(--lux-gold); font-size: 12.5px; padding: 5px 14px; border-radius: 999px;
}
.od-review-btn:active { transform: scale(.96); }
.od-reviewed { font-size: 12px; color: var(--lux-text-3); }

/* ---- 评价弹窗 ---- */
.rv-mask {
  position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
  background: rgba(0, 0, 0, .55); backdrop-filter: blur(2px); padding: 24px;
}
.rv-sheet {
  width: 100%; max-width: 380px; border-radius: 18px; padding: 22px 20px;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair); box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
}
.rv-title { font-size: 17px; font-weight: 700; color: var(--lux-text); }
.rv-goods {
  margin-top: 6px; font-size: 12.5px; color: var(--lux-text-2);
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.rv-stars { display: flex; gap: 6px; margin: 16px 0; justify-content: center; }
.rv-star { border: 0; background: transparent; cursor: pointer; font-size: 32px; line-height: 1; color: var(--lux-hair); transition: color .12s ease; }
.rv-star.on { color: var(--lux-gold); }
.rv-star:active { transform: scale(.9); }
.rv-textarea {
  width: 100%; box-sizing: border-box; resize: none; border-radius: 12px; padding: 12px;
  background: var(--lux-bg); border: 1px solid var(--lux-hair-soft); color: var(--lux-text); font-size: 14px;
}
.rv-textarea:focus { outline: none; border-color: var(--lux-gold); }
.rv-upload { margin-top: 12px; }
.rv-file { display: none; }
.rv-upload > span { display: block; margin-top: 6px; color: var(--lux-text-3); font-size: 11px; }
.rv-add-photo { padding: 8px 12px; border: 1px dashed var(--lux-hair); border-radius: 10px; background: transparent; color: var(--lux-text-2); cursor: pointer; }
.rv-preview-list { display: flex; gap: 8px; margin-bottom: 9px; overflow-x: auto; }
.rv-preview { position: relative; flex: 0 0 58px; width: 58px; height: 58px; }
.rv-preview img { width: 100%; height: 100%; border-radius: 9px; object-fit: cover; }
.rv-preview button { position: absolute; top: -5px; right: -5px; width: 19px; height: 19px; padding: 0; border: 0; border-radius: 50%; background: #2a2b2e; color: #fff; line-height: 19px; }
.rv-actions { display: flex; gap: 12px; margin-top: 18px; }
.rv-btn { flex: 1; height: 46px; font-size: 15px; }
</style>
