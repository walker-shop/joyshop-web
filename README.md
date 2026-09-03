# ZShop WebMCP — Human + Agent Shopping

ZShop is a multilingual storefront where a shopper and an AI agent work in the same live catalog and signed-in session. Its WebMCP site tools let an agent set a shared shopping goal, search and inspect products, read the cart, and add simple products without guessing through the UI.

**Live demo:** https://zshop.zwlab.app/

## Challenge extension

ZShop existed before the WebMCP Challenge. The WebMCP integration was added during the submission period in the dated commits beginning with `feat: add WebMCP shopping companion`. The challenge work adds the five registered site tools below, the shared human-agent companion UI, typed schemas and annotations, focused utility tests, and this public documentation. The existing catalog, authentication, and cart remain the underlying application.

## WebMCP tools

| Tool | Effect |
|---|---|
| `set_shopping_goal` | Writes a brief that is immediately visible in the page companion |
| `search_products` | Searches the live catalog and returns comparable product facts |
| `inspect_product` | Reads current price, fulfilment, description, and option requirements |
| `view_cart` | Reads the authenticated shopper cart and selected total |
| `add_product_to_cart` | Adds a simple product; option products return a selection URL instead of guessing |

Tools are registered from the top-level Nuxt page with `document.modelContext.registerTool`. Inputs are narrow and validated, write effects are described, and authentication continues to use the storefront's existing session.

## Try it

1. Open the deployed storefront in ChatGPT's in-app browser, or enable WebMCP testing in Chrome.
2. Open **Shop with an agent** to see shared goals and tool activity.
3. Ask: “Set my goal to a useful gift under ¥200, find options, compare them, and add the best simple product to my cart.”

## Local setup

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
