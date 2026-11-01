const optimizedBanners: Record<string, string> = {
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-01-new-arrivals.png": "/images/banners/banner-01-new-arrivals.webp",
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-02-mega-sale.png": "/images/banners/banner-02-mega-sale.webp",
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-03-fashion.png": "/images/banners/banner-03-fashion.webp",
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-04-smart-home.png": "/images/banners/banner-04-smart-home.webp",
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-05-sports.png": "/images/banners/banner-05-sports.webp",
  "https://blog-zwalker-bucket.s3.ap-southeast-1.amazonaws.com/joyshop/banners/banner-06-beauty.png": "/images/banners/banner-06-beauty.webp"
}

export const bannerImage = (url: string) => optimizedBanners[url] || url
