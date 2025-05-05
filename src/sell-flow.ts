import { Wormhole, routes } from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { MayanRouteSWIFT } from "@mayanfinance/wormhole-sdk-route";
import { TOKENS, ACCOUNTS, DEMO_AMOUNT, VAULT_TOKEN } from "./config";
import { getSigner } from "./helpers";

type TokenType = keyof typeof TOKENS.Base;

async function sellToken3643(outputToken: TokenType = "USDC") {
  console.log("🚀 Starting Token 3643 Sell Flow");
  console.log("----------------------------------------");

  // Initialize Wormhole with EVM platform
  const wh = new Wormhole("Mainnet", [EvmPlatform]);

  // Setup chains
  const sourceChain = wh.getChain("Optimism");
  const destChain = wh.getChain("Base");

  console.log(`📝 Flow: Vault (Optimism) -> User (Base)`);
  console.log(`💰 Amount: ${DEMO_AMOUNT} ${VAULT_TOKEN}`);
  console.log(`💱 Converting ${VAULT_TOKEN} to ${outputToken} for user`);

  // Setup token addresses
  const source = Wormhole.tokenId(
    sourceChain.chain,
    TOKENS.Optimism[VAULT_TOKEN]
  );
  const destination = Wormhole.tokenId(
    destChain.chain,
    TOKENS.Base[outputToken]
  );

  // Initialize route resolver with Mayan
  const resolver = wh.resolver([MayanRouteSWIFT]);

  // Get signers
  const vaultSigner = await getSigner(sourceChain, ACCOUNTS.VAULT.Optimism);
  const workerSigner = await getSigner(destChain, ACCOUNTS.WORKER.Base);
  const userSigner = await getSigner(destChain, ACCOUNTS.USER.Base);

  // Get balances before
  const vaultBalanceBefore = await sourceChain.getBalance(
    vaultSigner.address.address.toString(),
    source.address
  );
  const userBalanceBefore = await destChain.getBalance(
    userSigner.address.address.toString(),
    destination.address
  );

  console.log("🏦 Vault Address:", vaultSigner.address);
  console.log("👷 Worker Address:", workerSigner.address);
  console.log("👤 User Address:", userSigner.address);

  // Create transfer request
  const tr = await routes.RouteTransferRequest.create(wh, {
    source,
    destination,
  });

  // Find best route
  const foundRoutes = await resolver.findRoutes(tr);
  const bestRoute = foundRoutes[0]!;

  // Setup transfer parameters
  const transferParams = {
    amount: DEMO_AMOUNT,
    options: bestRoute.getDefaultOptions(),
  };

  // Validate route
  let validated = await bestRoute.validate(tr, transferParams);
  if (!validated.valid) {
    console.error("❌ Route validation failed:", validated.error);
    return;
  }

  // Get quote
  const quote = await bestRoute.quote(tr, validated.params);
  if (!quote.success) {
    console.error("❌ Quote failed:", quote.error.message);
    return;
  }

  console.log("💱 Quote received:", quote);
  console.log("----------------------------------------");

  // Initiate transfer from vault to user
  console.log(
    `🔄 Initiating transfer from vault to user (${VAULT_TOKEN} -> ${outputToken})...`
  );
  console.log(
    `💰 Amount: ${DEMO_AMOUNT} ${VAULT_TOKEN} -> ${(
      Number(quote.destinationToken.amount.amount) /
      Math.pow(10, quote.destinationToken.amount.decimals)
    ).toFixed(6)} ${outputToken}`
  );
  console.log("----------------------------------------");
  const receipt = await bestRoute.initiate(
    tr,
    vaultSigner.signer,
    quote,
    userSigner.address
  );
  console.log("📝 Transfer initiated with receipt:", receipt);
  console.log("----------------------------------------");

  // Worker completes the transfer on destination chain
  console.log("⏳ Worker completing transfer on Base...");
  await routes.checkAndCompleteTransfer(
    bestRoute,
    receipt,
    workerSigner.signer,
    15 * 60 * 1000
  );

  const vaultBalanceAfter = await sourceChain.getBalance(
    vaultSigner.address.address.toString(),
    source.address
  );
  const userBalanceAfter = await destChain.getBalance(
    userSigner.address.address.toString(),
    destination.address
  );

  console.log("✅ Sell Flow Complete!");
  console.log("🎉 Token 3643 has been sold!");

  // Print vault and user balances diff
  const vaultBalanceDiff = vaultBalanceAfter! - vaultBalanceBefore!;
  const userBalanceDiff = userBalanceAfter! - userBalanceBefore!;

  // Format balances
  const vaultBalanceDiffFormatted =
    Number(vaultBalanceDiff) / Math.pow(10, quote.sourceToken.amount.decimals);
  const userBalanceDiffFormatted =
    Number(userBalanceDiff) /
    Math.pow(10, quote.destinationToken.amount.decimals);

  console.log(
    `🏦 Vault Balance Diff: ${vaultBalanceDiffFormatted} ${VAULT_TOKEN}`
  );
  console.log(
    `💰 User Balance Diff: ${userBalanceDiffFormatted} ${outputToken}`
  );

  console.log("----------------------------------------");
}

// Run the sell flow with USDC
sellToken3643("USDC").catch(console.error);

// Example of running with USDT
// sellToken3643("USDT").catch(console.error);
