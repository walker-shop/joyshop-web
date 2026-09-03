<template>
  <aside class="agent-companion" :class="{ open }" aria-label="WebMCP shopping companion">
    <button class="agent-trigger" type="button" :aria-expanded="open" @click="open = !open">
      <span class="agent-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>
        <strong>Shop with an agent</strong>
        <small>{{ statusLabel }}</small>
      </span>
      <PhCaretUp :size="16" :class="{ rotated: open }" />
    </button>

    <div class="agent-reveal">
      <div class="agent-panel">
        <div class="agent-heading">
          <span>HUMAN + AGENT</span>
          <strong>One cart. Shared context.</strong>
          <p>Search, inspect and add products through the same live page and signed-in session.</p>
        </div>

        <div v-if="shoppingGoal" class="shopping-goal">
          <span>SHOPPING GOAL</span>
          <p>{{ shoppingGoal }}</p>
        </div>

        <ol class="tool-list" aria-label="Available agent actions">
          <li><span>01</span><div><strong>Set the brief</strong><small>Visible to both of you</small></div></li>
          <li><span>02</span><div><strong>Search & inspect</strong><small>Live catalog facts</small></div></li>
          <li><span>03</span><div><strong>Work the cart</strong><small>Uses your signed-in session</small></div></li>
        </ol>

        <div v-if="activities.length" class="activity-log" aria-live="polite">
          <span>LATEST TOOL CALL</span>
          <strong>{{ activities[0]?.tool.replaceAll('_', ' ') }}</strong>
          <p>{{ activities[0]?.summary }}</p>
        </div>
        <p v-else class="agent-hint">Ask your agent to “find a gift under ¥200 and compare the best options.”</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { PhCaretUp } from '@phosphor-icons/vue'

const open = ref(false)
const { supported, registered, shoppingGoal, activities } = useWebMcp()
const statusLabel = computed(() => {
  if (!supported.value) return 'Open in a WebMCP browser'
  if (!registered.value) return 'Registering WebMCP tools…'
  return `${registered.value} WebMCP tools ready`
})
</script>

<style scoped>
.agent-companion {
  position: fixed;
  right: var(--space-sm);
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 70;
  width: min(calc(100vw - 24px), 380px);
  color: var(--color-text-primary);
}
.agent-trigger {
  width: 100%; min-height: 56px; display: grid; grid-template-columns: 34px minmax(0, 1fr) 20px;
  align-items: center; gap: var(--space-sm); padding: 9px 12px; border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse);
  box-shadow: var(--shadow-float); cursor: pointer; text-align: left;
}
.agent-trigger > span:nth-child(2) { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.agent-trigger strong { font-family: var(--font-display); font-size: 14px; font-weight: 720; }
.agent-trigger small { color: color-mix(in oklch, var(--color-text-inverse) 74%, var(--color-primary-light)); font-size: 11px; }
.agent-trigger svg { transition: transform 180ms cubic-bezier(.22,.72,.24,1); }
.agent-trigger svg.rotated { transform: rotate(180deg); }
.agent-mark { width: 32px; height: 32px; display: flex; align-items: end; justify-content: center; gap: 3px; padding: 7px; border-radius: 50%; background: var(--color-primary-light); }
.agent-mark i { width: 3px; border-radius: 99px; background: var(--color-accent-ink); }
.agent-mark i:nth-child(1) { height: 9px; }
.agent-mark i:nth-child(2) { height: 17px; }
.agent-mark i:nth-child(3) { height: 12px; }
.agent-reveal { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 220ms cubic-bezier(.22,.72,.24,1); }
.agent-companion.open .agent-reveal { grid-template-rows: 1fr; }
.agent-panel { min-height: 0; overflow: hidden; margin-bottom: var(--space-xs); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); box-shadow: var(--shadow-float); }
.agent-heading { display: flex; flex-direction: column; gap: 6px; padding: var(--space-lg); }
.agent-heading > span, .shopping-goal > span, .activity-log > span { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 10px; font-weight: 760; letter-spacing: .13em; }
.agent-heading > strong { font-family: var(--font-display); font-size: 22px; letter-spacing: -.035em; }
.agent-heading p, .shopping-goal p, .activity-log p, .agent-hint { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.55; }
.shopping-goal { display: flex; flex-direction: column; gap: 5px; margin: 0 var(--space-lg) var(--space-md); padding: var(--space-sm); border: 1px solid var(--color-primary-light); border-radius: var(--radius-sm); background: var(--color-primary-soft); }
.tool-list { display: grid; gap: 0; margin: 0; padding: 0 var(--space-lg); list-style: none; }
.tool-list li { display: grid; grid-template-columns: 30px minmax(0,1fr); gap: var(--space-sm); align-items: center; padding: var(--space-sm) 0; border-top: 1px solid var(--color-border); }
.tool-list li > span { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 11px; font-weight: 760; }
.tool-list div { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-sm); }
.tool-list strong { font-size: 13px; font-weight: 680; }
.tool-list small { color: var(--color-text-tertiary); font-size: 11px; }
.activity-log { display: grid; gap: 4px; margin: var(--space-md) var(--space-lg) var(--space-lg); padding: var(--space-sm); border-radius: var(--radius-sm); background: var(--color-search-bg); }
.activity-log strong { font-size: 13px; text-transform: capitalize; }
.agent-hint { padding: var(--space-md) var(--space-lg) var(--space-lg); }
@media (min-width: 768px) {
  .agent-companion { right: var(--space-lg); bottom: var(--space-lg); }
}
@media (prefers-reduced-motion: reduce) {
  .agent-reveal, .agent-trigger svg { transition: none; }
}
</style>
