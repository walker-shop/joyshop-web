# ZShop E2E 回归

## purchase-regression.mjs — 购物全流程回归

覆盖 prod 上的完整购物闭环，逐步 ✅/❌，跑完自动清理：

登录(zshopbuyer) → 收货地址 → 加购+勾选 → 下单 → **发起支付(真出 Stripe `cs_test` 收银台)** → 4242 测试卡付款 → 回跳 → webhook 入账 `TRADE_SUCCESS` → 确认收货 `TRADE_FINISHED` → 清理。

订单生命周期用 API 驱动（稳定、不依赖易碎 UI 选择器）；Stripe 收银台必须真浏览器，用 CDP 驱动 walker Chrome。

### 前置
1. 开 walker Chrome 调试口：`chrome-debug`（端口 9222，函数在 `~/.zshrc`）
2. 装依赖：`cd e2e && npm i`（`node_modules` 已 gitignore）

### 运行
```bash
cd e2e
npm run regression        # 跑完自动删测试订单+清购物车
npm run regression:keep   # 保留订单不清理（排查用）
```
退出码 0 = 全 PASS，非 0 = 有步骤失败。

### 说明 / 坑
- **Stripe 是 `sk_test` 沙盒**，用测试卡 `4242 4242 4242 4242`（任意未来月年 + 任意 CVC），**零真实扣款**。
- 测试账号 `zshopbuyer`（普通顾客，见 `docs/joyshop/credentials.md`），别用管理员 joyadmin。
- **库存漂移**：API 删单**不回补库存**，每跑一次 goods 1 库存 -1（基数够大不致命）。要归零漂移得直连 DB `UPDATE joyshop_inventory.inventory SET stock=stock+1 WHERE goods_id=1`（mysql8 容器，prod）。
- zshopbuyer 的收货地址创建后**复用**，不随清理删除。
- API base = `https://zshop-admin.zwlab.app/api`（所有 `/v1/*`）；IAM = `https://iam-api.walker-learn.xyz`。
