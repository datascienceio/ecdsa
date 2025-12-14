const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "0x1e7cff229debec429f694a18353d152ffe61fee9": 100,
  "0xaf558461d11d8d3f82d5551469055be64075cd48": 50,
  "0xa3b78cd7bf62d367ec9c5ec158ebaaf44d33f4be": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function recoverAddress(message, signature, recoveryBit) {
  const hash = hashMessage(message);
  const sig = new Uint8Array(signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const publicKey = secp.recoverPublicKey(hash, sig, recoveryBit);
  const address = toHex(keccak256(publicKey.slice(1)).slice(-20));
  return "0x" + address;
}

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  const addressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!sender || !recipient) {
    return res.status(400).send({ message: "Sender and recipient are required!" });
  }

  if (!addressRegex.test(sender) || !addressRegex.test(recipient)) {
    return res.status(400).send({ message: "Invalid address format!" });
  }

  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(amount)) {
    return res.status(400).send({ message: "Amount must be a positive integer!" });
  }

  if (!signature || typeof signature !== 'string' || signature.length !== 128) {
    return res.status(400).send({ message: "Invalid signature!" });
  }

  if (recoveryBit !== 0 && recoveryBit !== 1) {
    return res.status(400).send({ message: "Invalid recovery bit!" });
  }

  const message = JSON.stringify({ sender, recipient, amount });
  let recoveredAddress;
  
  try {
    recoveredAddress = recoverAddress(message, signature, recoveryBit);
  } catch (error) {
    return res.status(400).send({ message: "Invalid signature!" });
  }

  if (recoveredAddress.toLowerCase() !== sender.toLowerCase()) {
    return res.status(401).send({ message: "Signature verification failed!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;

    const txHash = toHex(keccak256(utf8ToBytes(JSON.stringify({ sender, recipient, amount, timestamp: Date.now() }))));

    res.send({ 
      balance: balances[sender], 
      message: "Transfer successful! 🔐",
      transactionHash: txHash,
      verified: true
    });
  }
});

app.listen(port, 'localhost', () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
