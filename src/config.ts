import dotenv from "dotenv";

// Initialize dotenv
dotenv.config();

// Token addresses for different chains
export const TOKENS = {
  Polygon: {
    USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    USDT: "0x3553f861dec0257bada9f8ed268bf0d74e45e89c",
  },
  Optimism: {
    USDC: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    USDT: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  },
  Arbitrum: {
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  },
  Base: {
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    USDT: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  },
} as const;

// Account roles
export const ACCOUNTS = {
  USER: {
    Polygon: process.env.USER_PRIVATE_KEY || "",
    Optimism: process.env.USER_PRIVATE_KEY || "",
    Base: process.env.USER_PRIVATE_KEY || "",
  },
  VAULT: {
    Optimism: process.env.VAULT_PRIVATE_KEY || "",
    Base: process.env.VAULT_PRIVATE_KEY || "",
  },
  WORKER: {
    Arbitrum: process.env.WORKER_PRIVATE_KEY || "",
    Optimism: process.env.WORKER_PRIVATE_KEY || "",
    Base: process.env.WORKER_PRIVATE_KEY || "",
  },
};

// Token ID for our demo token
export const TOKEN_3643 = "3643";

// Amount to transfer in the demo
export const DEMO_AMOUNT = "1";

// Vault's token (always USDC)
export const VAULT_TOKEN = "USDT";
