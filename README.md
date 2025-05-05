# BoulderTech Demo

This demo showcases two different flows for simulating a purchase and sale of a Token 3643 using Wormhole-Mayan Swift for cross-chain transfers:

1. Purchase Flow: User buys Token 3643 with stablecoins in another chain
2. Sell Flow: User sells Token 3643 and receives stablecoins in another chain

> [!IMPORTANT]
> This demo only works on **mainnet**. Testing on testnet environments will fail.

## Demo
https://github.com/user-attachments/assets/8ba0a478-94e8-40e7-98b6-0c41fd7c86ae



## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the following private keys:

```env
# User accounts
USER_PRIVATE_KEY=your_private_key_here

# Vault account
VAULT_PRIVATE_KEY=your_private_key_here
```

## Usage

### Purchase Flow

To demonstrate the purchase flow (User (Polygon) -> Vault (Optimism)):

```bash
npm run purchaseFlow
```

This will:

1. User sends USDC from Polygon to Optimism
2. BoulderTech Vault receives the funds on Optimism
3. Token 3643 is purchased (simulated)
4. Shows balance changes for both user and vault

### Sell Flow

To demonstrate the sell flow (Vault (Optimism) -> User (Base)):

```bash
npm run sellFlow
```

This will:

1. Token 3643 is sold (simulated)
2. Vault sends USDT from Optimism to Base
3. User receives the funds on Base
4. Shows balance changes for both vault and user

## Notes

- Make sure all accounts have sufficient funds for gas fees
- The demo uses USDC/USDT as the tokens for transfers
- All transfers use Mayan Swift for cross-chain functionality
- The demo includes detailed console logs to track the progress of each step
- Balance changes are displayed with proper decimal formatting
