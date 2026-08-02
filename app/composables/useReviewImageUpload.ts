export function useReviewImageUpload() {
  const config = useRuntimeConfig()
  const { token, user } = useAuth()
  const apiBase = config.public.apiBase as string

  async function upload(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('只能上传图片')
    if (file.size > 5 * 1024 * 1024) throw new Error('单张图片不能超过 5MB')
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('仅支持 JPG、PNG、WebP')
    const filename = `reviews/${user.value?.id || 'u'}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const tok = await $fetch<{ data: { uploadUrl: string; fileUrl: string } }>(
      `${apiBase}/v1/upload/token`,
      { params: { filename }, headers: { Authorization: `Bearer ${token.value}` } },
    )
    await $fetch(tok.data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    return tok.data.fileUrl
  }

  return { upload }
}
