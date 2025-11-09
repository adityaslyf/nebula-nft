import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity, generateSigner } from "@metaplex-foundation/umi";
import { createV1 } from "@metaplex-foundation/mpl-core";
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

  const tx = await createV1(umi, {
    asset: assetSigner,
    name: "Nebula NFT #1",
    uri: "https://scarlet-imaginative-guineafowl-522.mypinata.cloud/ipfs/bafkreifqgslcxfkrvojzns7f5yolayztaumu7p4msxhllnrz4c3hapj73y",
    sellerFeeBasisPoints: 500,
    payer: mySigner,
    authority: mySigner,
  }).sendAndConfirm(umi);

  console.log("NFT Minted Successfully!");
  console.log("Transaction Signature:", tx.signature);
  console.log("\nView your NFT on:");
  console.log(`  Solana Explorer: https://explorer.solana.com/address/${assetSigner.publicKey}?cluster=devnet`);
  console.log(`  Solscan: https://solscan.io/token/${assetSigner.publicKey}?cluster=devnet`);
  console.log(`  XRAY: https://xray.helius.xyz/token/${assetSigner.publicKey}?network=devnet`);
  console.log("\nNote: It may take 5-15 minutes for the image to appear in explorers.");
}

main().catch(console.error);
