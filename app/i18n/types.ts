// i18n 消息 schema：typed 保证各语言缺 key 编译期报错
export interface MessageSchema {
  common: {
    loading: string
    loginRequired: string
    addToCart: string
    addedToCart: string
    addToCartFailed: string
    back: string
  }
  nav: {
    home: string
    category: string
    cart: string
    mine: string
  }
  home: {
    searchPlaceholder: string
    heroTag: string
    heroTitle1: string
    heroTitle2: string
    heroSubtitle: string
    flashSale: string
    flashEndIn: string
    viewAll: string
    recommend: string
    recommendSub: string
    emptyGoods: string
    tagHot: string
    tagNew: string
    tagFreeShip: string
  }
  login: {
    title: string
    subtitle: string
    account: string
    accountPlaceholder: string
    password: string
    passwordPlaceholder: string
    submit: string
    noAccount: string
    register: string
    perkGenuine: string
    perkRefund: string
    perkMember: string
    needBoth: string
    loginSuccess: string
    loginFailed: string
  }
  user: {
    memberBadge: string
    guestTitle: string
    guestSubtitle: string
    points: string
    coupons: string
    favorites: string
    pointsWip: string
    couponsWip: string
    favoritesWip: string
    myOrders: string
    allOrders: string
    orderUnpaid: string
    orderPaid: string
    orderClosed: string
    orderAll: string
    address: string
    myFavorites: string
    support: string
    supportWip: string
    darkMode: string
    themeSystem: string
    themeLight: string
    themeDark: string
    logout: string
    loggedOut: string
    avatarUpdated: string
    avatarLocalPreview: string
    language: string
  }
}
