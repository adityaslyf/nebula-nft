import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity, generateSigner } from "@metaplex-foundation/umi";
import { create, ruleSet } from "@metaplex-foundation/mpl-core";
import fs from "fs";

async function main() {
  const secretKey = JSON.parse(
    fs.readFileSync(`${process.env.HOME}/.config/solana/devnet.json`, "utf8")
  );
  const umi = createUmi("https://api.devnet.solana.com");

  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
  const mySigner = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(mySigner));

  console.log("Wallet Public Key:", mySigner.publicKey.toString());

  const assetSigner = generateSigner(umi);

  const tx = await create(umi, {
    asset: assetSigner,
    name: "Nebula NFT #1",
    uri: "https://scarlet-imaginative-guineafowl-522.mypinata.cloud/ipfs/bafkreifqgslcxfkrvojzns7f5yolayztaumu7p4msxhllnrz4c3hapj73y",
    plugins: [
      {
        type: "Royalties",
        basisPoints: 500, // 5% royalty (500 basis points = 5%)
        creators: [
          {
            address: mySigner.publicKey,
            percentage: 100, // 100% of royalties go to this address
          },
        ],
        ruleSet: ruleSet("None"), // Compatibility rule set
      },
    ],
  }).sendAndConfirm(umi);

  console.log("NFT Minted Successfully!");
  console.log("Transaction Signature:", tx.signature);
  console.log("\nView your NFT on:");
  console.log(`  Metaplex Core Explorer: https://core.metaplex.com/explorer/${assetSigner.publicKey}?env=devnet`);
  console.log(`  Solscan: https://solscan.io/token/${assetSigner.publicKey}?cluster=devnet`);
  console.log(`  XRAY: https://xray.helius.xyz/token/${assetSigner.publicKey}?network=devnet`);
  console.log(`  Solana Explorer: https://explorer.solana.com/address/${assetSigner.publicKey}?cluster=devnet`);
  console.log("\nNote: It may take 5-15 minutes for the image to appear in explorers.");
}

main().catch(console.error);
