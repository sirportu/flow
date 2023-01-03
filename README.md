# How to use Flow's Transactions and Scripts

## Dependencies needed

Add the following dependencies to the project:

```bash
npm install @onflow/fcl @onflow/types
```

## Project's configuration

### Add FCL configuration

```javascript
import * as fcl from "@onflow/fcl";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");
```

### Add the 'cadence' folder to your project

This folder contains the scripts and transactions you will need to interact with Flow using FCL.

## User's authentication and log out

```javascript
const [isConnected, setIsConnected] = useState(false);
const [user, setUser] = useState(null);

const login = () => {
  if (fcl.currentUser()) {
    logout();
  }
  fcl.authenticate();
  setIsConnected(true);
};

const logout = () => {
  fcl.unauthenticate();
  setIsConnected(false);
  setUser(null);
};

useEffect(() => {
  fcl.currentUser().subscribe(setUser);
}, []);
```

## Setup Account

Allows the user to list NFTs and be able to sell them:

```javascript
import { setupAccount } from "../cadence/transactions/setup_account";

const setupAccountFunction = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction(setupAccount),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log(transactionId);
  return fcl.tx(transactionId).onceSealed();
};
```

## Setup Collection

Allows users to store the collection's NFTs on their wallet

```javascript
import { setupCollection } from "../cadence/transactions/setup_collection";

const setupCollectionFunction = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction(setupCollection),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log(transactionId);
  return fcl.tx(transactionId).onceSealed();
};
```

## Mint NFTs

```javascript
import { mintNFT } from "../cadence/transactions/mint_nft";

const mintNFTFunction = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction(mintNFT),
      fcl.args([
        fcl.arg(user.addr, types.Address), // Creator's wallet addresss
        fcl.arg("Test NFT", types.String), // NFT's name
        fcl.arg("This is a Test NFT", types.String), // NFT's description
        fcl.arg(
          "https://static.wikia.nocookie.net/onepiece/images/a/af/Monkey_D._Luffy_Anime_Dos_A%C3%B1os_Despu%C3%A9s_Infobox.png/revision/latest?cb=20200616015904&path-prefix=es",
          types.String
        ), // NFT's image url
      ]),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log(transactionId);
  return fcl.tx(transactionId).onceSealed();
};
```

## Get User's NFT's

```javascript
import { getNFTsScript } from "../cadence/scripts/getNFTs";

const getNFTs = async () => {
  const result = await fcl
    .send([
      fcl.script(getNFTsScript),
      fcl.args([
        fcl.arg(address, types.Address), // User's wallet address
        fcl.arg(
          {
            domain: "public", // public | private | storage
            identifier: "exampleNFTCollection", // Identifier set when creating the Contract
          },
          types.Path
        ),
      ]),
    ])
    .then(fcl.decode);

  setCollection(result);
  console.log(result);
};
```

## Get NFT's on sale for specific user

```javascript
import { readAccountSells } from "../cadence/scripts/ReadAccountSells";

const getNFTsonSale = async () => {
  const result = await fcl
    .send([
      fcl.script(readAccountSells),
      fcl.args([fcl.arg(address, types.Address)]),
    ])
    .then(fcl.decode);

  setNftOnSale(result);
  console.log(result);
};
```

## Get Details for NFT

```javascript
import { getDetails } from "../cadence/scripts/getDetails";

const getDetailsOfOneNFTOnSale = async (id, userAddress) => {
  const result = await fcl
    .send([
      fcl.script(getDetails),
      fcl.args([
        fcl.arg(userAddress, types.Address),
        fcl.arg(id, types.UInt64),
      ]),
    ])
    .then(fcl.decode);

  console.log("NFT detail:", result);
};
```

## Put NFT on sale

```javascript
import { sellItem } from "../cadence/transactions/sell_item";

const sellNFT = async (id) => {
  const transactionId = await fcl
    .send([
      fcl.transaction(sellItem),
      fcl.args([
        fcl.arg(id, types.UInt64), // Item id
        fcl.arg("100.0", types.UFix64), // Item price
        fcl.arg("1", types.String), // Custom id
        fcl.arg("10.0", types.UFix64), // Commission Amount
      ]),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log(transactionId);
  return fcl.tx(transactionId).onceSealed();
};
```

## Buy NFT

```javascript
import { BuyItemFromMarketPlace } from "../cadence/transactions/buy_item";

const buyNFTMarketPlace = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction(BuyItemFromMarketPlace),
      fcl.args([
        fcl.arg(id, types.UInt64), // NFT's ID
        fcl.arg(address, types.Address), // Buyer's wallet address
        fcl.arg("0x8c1a6715c11b4ea3", types.Optional(types.Address)), // Commission's wallet address
      ]),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log("NFT Bought", transactionId);
  const sealed = fcl.tx(transactionId).onceSealed();
  return sealed;
};
```

## Clean Up sale

```javascript
import { CleanUp } from "../cadence/transactions/cleanUp";

const cleanSales = async () => {
  const cleanUp = await fcl
    .send([
      fcl.transaction(CleanUp),
      fcl.args([
        fcl.arg(address, types.Address), // Storefront Address
        fcl.arg(id, types.UInt64), // Item id
      ]),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.proposer(fcl.authz),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  console.log("cleanup ", cleanUp);
  return fcl.tx(cleanUp).onceSealed();
};
```

# Notes

Other scripts and transactions can be added to the project depending on the requirements needed, also current contracts can be modified to accommodate specific use cases
