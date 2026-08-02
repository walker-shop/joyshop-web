/**
 * 统一头像上传：oss-web 预签名直传 S3（images.walker-learn.xyz）
 * → walker-iam PUT /api/user/profile 落档（avatar 归属统一身份，全端共享）。
 * IAM 与 oss-web 均为多项目共用服务，故头像一处更新、各 app 生效。
 */
export function useAvatarUpload() {
  const config = useRuntimeConfig()
  const { token, user } = useAuth()
  const apiBase = config.public.apiBase as string
  const iamBase = config.public.iamBase as string

  async function upload(file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const filename = `avatars/${user.value?.id || 'u'}-${Date.now()}.${ext}`

    // 1. 取预签名上传地址 + 最终 CDN URL
    const tok = await $fetch<{ data: { uploadUrl: string; fileUrl: string } }>(
	  `${apiBase}/v1/upload/token`,
	  { params: { filename }, headers: { Authorization: `Bearer ${token.value}` } },
	)
    const { uploadUrl, fileUrl } = tok.data
    if (!uploadUrl || !fileUrl) throw new Error('获取上传地址失败')

    // 2. 直传 S3（PUT 到预签名地址）
    await $fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg' },
    })

    // 3. 写回统一身份服务（walker-iam）
    await $fetch(`${iamBase}/api/user/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { avatar: fileUrl },
    })

    if (user.value) user.value.avatar = fileUrl
    return fileUrl
  }

  return { upload }
}
