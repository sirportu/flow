import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getDetails } from "../cadence/scripts/getDetails";
import { getNFTsScript } from "../cadence/scripts/getNFTs";
import { getTotalSupply } from "../cadence/scripts/getTotalSupply";
import { getPublicPath } from "../cadence/scripts/getPublicPath";
import { readAccountSells } from "../cadence/scripts/ReadAccountSells";
import { sellItem } from "../cadence/transactions/sell_item";

import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

export const Collection = ({ address, timeStamp, setShowSpinner }) => {
  let nftOnSaleAux = [];
  const [collection, setCollection] = useState([]);
  const [nftOnSale, setNftOnSale] = useState([]);
  const [nftDetail, setNftDetail] = useState([]);
  const [render, setRender] = useState(false);

  const getNFTs = async () => {
    try {
      setShowSpinner(true);
      const result = await fcl
        .send([
          fcl.script(getNFTsScript),
          fcl.args([
            fcl.arg("0xb1bc33659bb2508e", types.Address)
          ]),
        ])
        .then(fcl.decode);

      setNftDetail([]);
      setCollection(result);
      console.log(result);
    } catch (err) {
      console.log(err);
    } finally {
      setShowSpinner(false);
    }
  };
  const getTotalSupplyNFTs = async () => {
    try {
      setShowSpinner(true);
      const result = await fcl
        .send([
          fcl.script(getTotalSupply),
        ])
        .then(fcl.decode);
      console.log("totalSupply", result);
    } catch (err) {
      console.log(err);
    } finally {
      setShowSpinner(false);
    }
  };

  const getCollectionPublicPath = async () => {
    try {
      setShowSpinner(true);
      const result = await fcl
        .send([
          fcl.script(getPublicPath),
        ])
        .then(fcl.decode);
      console.log("pp", result);
    } catch (err) {
      console.log(err);
    } finally {
      setShowSpinner(false);
    }
  };

  const getNFTsonSale = async () => {
    try {
      setShowSpinner(true);
      const result = await fcl
        .send([
          fcl.script(readAccountSells),
          fcl.args([fcl.arg(address, types.Address)]),
        ])
        .then(fcl.decode);
      setNftOnSale(result);
      nftOnSaleAux = result;
      console.log(result);
    } catch (err) {
      alert(err);
    } finally {
      setShowSpinner(false);
    }
  };

  const getDetailsOfOneNFTOnSale = async (id, userAddress) => {
    try {
      setShowSpinner(true);
      const result = await fcl
        .send([
          fcl.script(getDetails),
          fcl.args([
            fcl.arg(userAddress, types.Address),
            fcl.arg(id, types.UInt64),
          ]),
        ])
        .then(fcl.decode);

      if (!nftDetail.find(f => f.nftID == result.nftID)) {
        nftDetail.push(result);
      }
      if (nftDetail.length >= nftOnSale.length) {
        setRender(true);
      } else {
        setRender(false);
      }
      /*if (isMyNFTs) {
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
      }*/

      console.log("NFT details:", result);
    } catch (err) {
      alert(err);
    } finally {
      setShowSpinner(false);
    }
  };

  const sellNFT = async (id) => {
    try {
      setShowSpinner(true);
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

      await fcl.tx(transactionId).onceSealed();
    } catch (err) {
      alert(err);
    } finally {
      setShowSpinner(false);
    }

    await getNFTs();
  };

  useEffect(() => {
    if (address) {
      getTotalSupplyNFTs();
      getNFTs();
      getCollectionPublicPath();
    }
  }, [address]);

  useEffect(() => {
    if (address && timeStamp) {
      getTotalSupply();
      getNFTs();
      getCollectionPublicPath();
    }
  }, [timeStamp]);

  useEffect(() => {
    if (collection.length) getNFTsonSale();
  }, [collection]);

  useEffect(() => {
    if (nftOnSale.length)
      nftOnSale.forEach((nft) => {
        getDetailsOfOneNFTOnSale(nft, address);
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
                {nftOnSale.length == 0 ||
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
        onClick={() => getNFTsonSale()}>
        get nft on sale
      </button>
      {<p> {nftOnSale.join(", ")} </p>}
    </div>
  );
};
