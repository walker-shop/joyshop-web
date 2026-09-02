export interface WebMcpActivity {
  id: number
  tool: string
  summary: string
  at: string
}

export function useWebMcp() {
  const supported = useState<boolean>('webmcp-supported', () => false)
  const registered = useState<number>('webmcp-registered', () => 0)
  const shoppingGoal = useState<string>('webmcp-shopping-goal', () => '')
  const activities = useState<WebMcpActivity[]>('webmcp-activities', () => [])

  function record(tool: string, summary: string) {
    activities.value = [
      { id: Date.now(), tool, summary, at: new Date().toISOString() },
      ...activities.value,
    ].slice(0, 4)
  }

  return { supported, registered, shoppingGoal, activities, record }
}
