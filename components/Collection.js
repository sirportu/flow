import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getDetails } from "../cadence/scripts/getDetails";
import { getNFTsScript } from "../cadence/scripts/getNFTs";
import { readAccountSells } from "../cadence/scripts/ReadAccountSells";
import { sellItem } from "../cadence/transactions/sell_item";

export const Collection = ({ address }) => {
  let nftOnSaleAux = [];
  const [collection, setCollection] = useState([]);
  const [nftOnSale, setNftOnSale] = useState([]);
  const [myNftOnSale, setMyNftOnSale] = useState([]);
  const [nftDetail, setNftDetail] = useState([]);
  const [render, setRender] = useState(false);

  const getNFTs = async () => {
    const result = await fcl
      .send([
        fcl.script(getNFTsScript),
        fcl.args([
          fcl.arg(address, types.Address),
          fcl.arg(
            {
              domain: "public", // public | private | storage
              identifier: "exampleNFTCollection",
            },
            types.Path
          ),
        ]),
      ])
      .then(fcl.decode);
    setCollection(result);
    console.log(result);
  };

  const getNFTsonSale = async () => {
    const result = await fcl
      .send([
        fcl.script(readAccountSells),
        fcl.args([fcl.arg(address, types.Address)]),
      ])
      .then(fcl.decode);
    setNftOnSale(result);
    nftOnSaleAux = result;
    console.log(result);
  };

  const getDetailsOfOneNFTOnSale = async (id, userAddress, isMyNFTs) => {
    const result = await fcl
      .send([
        fcl.script(getDetails),
        fcl.args([
          fcl.arg(userAddress, types.Address),
          fcl.arg(id, types.UInt64),
        ]),
      ])
      .then(fcl.decode);

    if (isMyNFTs) {
      nftDetail.push(result);
      if (nftDetail.length >= myNftOnSale.length) {
        setRender(true);
      }
    } else {
      if (new Date(result.expiry * 1000) < new Date()) {
        nftOnSaleAux = nftOnSaleAux.filter((item) => item != id);
        if (nftDetail.length >= nftOnSale.length) {
          setNftOnSale(nftOnSaleAux);
        }
      }
    }

    console.log("NFT details:", result);
  };

  const sellNFT = async (id) => {
    const transactionId = await fcl
      .send([
        fcl.transaction(sellItem),
        fcl.args([
          fcl.arg(id, types.UInt64),
          fcl.arg("100.0", types.UFix64),
          fcl.arg("1", types.String),
          fcl.arg("10.0", types.UFix64),
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

  useEffect(() => {
    if (address) {
      getNFTs();
    }
  }, [address]);

  useEffect(() => {
    if (collection.length) getMyNFTsonSale();
  }, [collection]);

  useEffect(() => {
    if (myNftOnSale.length)
      myNftOnSale.forEach((nft) => {
        getDetailsOfOneNFTOnSale(nft, address, true);
      });
  }, [myNftOnSale]);

  useEffect(() => {
    if (nftOnSale.length)
      nftOnSale.forEach((nft) => {
        getDetailsOfOneNFTOnSale(nft, address, false);
      });
  }, [nftOnSale]);

  const RenderSell = (nftId) => {
    return { status: !nftDetail.find((f) => f.nftID == nftId) };
  };

  return (
    <div
      style={{
        overflow: "scroll",
        width: "100%",
        display: "grid",
      }}
    >
      <h3>{address ? "Demo NFTs" : null}</h3>
      <div
        style={{
          display: "flex",
          gap: "20px",
          "margin-bottom": "20px",
        }}
      >
        {collection && address && collection.length
          ? collection.map((nft, index) => (
              <div
                key={index}
                id={nft}
                style={{
                  width: "250px",
                  height: "250px",
                  position: "relative",
                  background: "#c3c3c3",
                  borderRadius: "5px",
                }}
              >
                <Image src={"/placeholder.png"} fill alt="placeholder" />
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    bottom: "0",
                    left: "0",
                  }}
                >
                  {myNftOnSale.length == 0 ||
                  (render && RenderSell(nft).status) ? (
                    <button
                      onClick={() => sellNFT(nft)}
                      style={{
                        width: "100%",
                        color: "white",
                        padding: "10px",
                        cursor: "pointer",
                      }}
                    >
                      {" "}
                      Sell NFT ({nft}){" "}
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          : null}
      </div>
      <button
        style={{ "max-width": "100px", "margin-bottom": "20px" }}
        onClick={() => getNFTsonSale()}
      >
        get nft on sale
      </button>
      {<p> {nftOnSale.join(", ")} </p>}
    </div>
  );
};
