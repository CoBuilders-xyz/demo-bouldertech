import { Wormhole, routes } from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { MayanRouteSWIFT } from "@mayanfinance/wormhole-sdk-route";
import { TOKENS, ACCOUNTS, DEMO_AMOUNT, VAULT_TOKEN } from "./config";
import { getSigner } from "./helpers";

type TokenType = keyof typeof TOKENS.Polygon;

async function purchaseToken3643() {
  const inputToken: TokenType = "USDC";
  console.log("🚀 Starting Token 3643 Purchase Flow with USDC");
  console.log("----------------------------------------");

  // Initialize Wormhole with EVM platform
  const wh = new Wormhole("Mainnet", [EvmPlatform]);

  // Setup chains
  const sourceChain = wh.getChain("Polygon");
  const destChain = wh.getChain("Optimism");

  console.log(`📝 Flow: User (Polygon) -> Vault (Optimism)`);
  console.log(`💰 Amount: ${DEMO_AMOUNT} ${inputToken}`);
  console.log(`💱 Converting ${inputToken} to ${VAULT_TOKEN} for vault`);
  console.log("----------------------------------------");

  // Setup token addresses
  const source = Wormhole.tokenId(
    sourceChain.chain,
    TOKENS.Polygon[inputToken]
  );
  const destination = Wormhole.tokenId(
    destChain.chain,
    TOKENS.Optimism[VAULT_TOKEN]
  );

  // Initialize route resolver with Mayan
  const resolver = wh.resolver([MayanRouteSWIFT]);

  // Get signers
  const userSigner = await getSigner(sourceChain, ACCOUNTS.USER.Polygon);
  const workerSigner = await getSigner(destChain, ACCOUNTS.WORKER.Optimism);
  const vaultSigner = await getSigner(destChain, ACCOUNTS.VAULT.Optimism);

  // Get balances before
  const userBalanceBefore = await sourceChain.getBalance(
    userSigner.address.address.toString(),
    source.address
  );
  const vaultBalanceBefore = await destChain.getBalance(
    vaultSigner.address.address.toString(),
    destination.address
  );

  console.log("👤 User Address:", userSigner.address);
  console.log("👷 Worker Address:", workerSigner.address);
  console.log("🏦 Vault Address:", vaultSigner.address);
  console.log("----------------------------------------");

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

  // Initiate transfer from user to vault
  console.log(
    `🔄 Initiating transfer from user to vault (${inputToken} -> ${VAULT_TOKEN})...`
  );
  console.log(
    `💰 Amount: ${DEMO_AMOUNT} ${inputToken} -> ${(
      Number(quote.destinationToken.amount.amount) /
      Math.pow(10, quote.destinationToken.amount.decimals)
    ).toFixed(6)} ${VAULT_TOKEN}`
  );
  console.log("----------------------------------------");
  const receipt = await bestRoute.initiate(
    tr,
    userSigner.signer,
    quote,
    vaultSigner.address
  );
  console.log("📝 Transfer initiated with receipt:", receipt);
  console.log("----------------------------------------");
  // Worker completes the transfer on destination chain
  console.log("⏳ Worker completing transfer on Optimism...");
  await routes.checkAndCompleteTransfer(
    bestRoute,
    receipt,
    workerSigner.signer,
    15 * 60 * 1000
  );

  const userBalanceAfter = await sourceChain.getBalance(
    userSigner.address.address.toString(),
    source.address
  );
  const vaultBalanceAfter = await destChain.getBalance(
    vaultSigner.address.address.toString(),
    destination.address
  );

  console.log("✅ Purchase Flow Complete!");
  console.log("🎉 Token 3643 has been purchased!");

  // Print user and vault balances diff
  const userBalanceDiff = userBalanceAfter! - userBalanceBefore!;
  const vaultBalanceDiff = vaultBalanceAfter! - vaultBalanceBefore!;

  // Format balances
  const userBalanceDiffFormatted =
    Number(userBalanceDiff) /
    Math.pow(10, quote.destinationToken.amount.decimals);
  const vaultBalanceDiffFormatted =
    Number(vaultBalanceDiff) /
    Math.pow(10, quote.destinationToken.amount.decimals);

  console.log(
    `💰 User Balance Diff: ${userBalanceDiffFormatted} ${inputToken}`
  );
  console.log(
    `🏦 Vault Balance Diff: ${vaultBalanceDiffFormatted} ${VAULT_TOKEN}`
  );

  console.log("----------------------------------------");
}

// Run the purchase flow with USDC
purchaseToken3643().catch(console.error);
