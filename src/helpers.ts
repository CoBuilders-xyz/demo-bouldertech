import { ChainContext, Wormhole } from "@wormhole-foundation/sdk-connect";
import { getEvmSignerForKey } from "@wormhole-foundation/sdk-evm";

export async function getSigner(
  chain: ChainContext<any, any, any>,
  privateKey?: string
) {
  if (!privateKey) {
    throw new Error("Private key is required");
  }

  const rpc = await chain.getRpc();
  const signer = await getEvmSignerForKey(rpc, privateKey);

  return {
    signer,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}
