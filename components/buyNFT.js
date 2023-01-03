import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import React, { useState } from "react";
import { BuyItemFromMarketPlace } from "../cadence/transactions/buy_item";
import { CleanUp } from "../cadence/transactions/cleanUp";

export const BuyNFT = ({ address }) => {
  const [id, setId] = useState(null);

  const cleanSales = async () => {
    const cleanUp = await fcl
      .send([
        fcl.transaction(CleanUp),
        fcl.args([fcl.arg(address, types.Address), fcl.arg(id, types.UInt64)]),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.proposer(fcl.authz),
        fcl.limit(9999),
      ])
      .then(fcl.decode);
    console.log("cleanup ", cleanUp);

    return fcl.tx(cleanUp).onceSealed();
  };

  const buyNFTMarketPlace = async () => {
    const transactionId = await fcl
      .send([
        fcl.transaction(BuyItemFromMarketPlace),
        fcl.args([
          fcl.arg(id, types.UInt64),
          fcl.arg(address, types.Address),
          fcl.arg("0x8c1a6715c11b4ea3", types.Optional(types.Address)),
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

  const handleId = (e) => {
    setId(e.target.value);
  };

  return (
    <div>
      <h3>Buy NFTs</h3>
      <input type={"text"} onChange={handleId} />
      <button style={{ margin: "0 10px" }} onClick={() => buyNFTMarketPlace()}>
        {" "}
        Buy NFT Button{" "}
      </button>
      <button onClick={() => cleanSales()}> CleanUP </button>
    </div>
  );
};
