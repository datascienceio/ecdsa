const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

function generateKeyPair() {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey);
  
  const address = toHex(keccak256(publicKey.slice(1)).slice(-20));
  
  return {
    privateKey: toHex(privateKey),
    publicKey: toHex(publicKey),
    address: "0x" + address
  };
}

console.log("\nGenerated Test Accounts:\n");
console.log("=" .repeat(80));

for (let i = 1; i <= 3; i++) {
  const account = generateKeyPair();
  console.log(`\nAccount ${i}:`);
  console.log(`  Address:     ${account.address}`);
  console.log(`  Private Key: ${account.privateKey}`);
  console.log(`  Public Key:  ${account.publicKey}`);
}

console.log("\n" + "=".repeat(80));
console.log("\nUse these private keys in the app to sign transactions!\n");
