import React, { useEffect, useState } from 'react'
import { getNFTsScript } from '../cadence/scripts/getNFTs'
import { readAccountSells } from '../cadence/scripts/ReadAccountSells'
import { getDetails } from '../cadence/scripts/getDetails'
import Image from 'next/image'
import { sellItem } from "../cadence/transactions/sell_item";
import * as fcl from "@onflow/fcl"
import * as types from "@onflow/types"

export const Collection = ({ address }) => {
    let nftOnSaleAux = [];
    const [collection, setCollection] = useState([]);
    const [nftOnSale, setNftOnSale] = useState([]);
    const [myNftOnSale, setMyNftOnSale] = useState([]);
    const [nftDetail, setNftDetail] = useState([]);
    const [render, setRender] = useState(false);
    const getNFTs = async () => {
        const result = await fcl.send([
            fcl.script(getNFTsScript),
            fcl.args([
                fcl.arg(address, types.Address),
                fcl.arg({
                    domain: "public",                // public | private | storage
                    identifier: "exampleNFTCollection"
                }, types.Path),
            ])
        ]).then(fcl.decode)
        setCollection(result);
        console.log(result);
        getMyNFTsonSale();
    }

    const getMyNFTsonSale = async () => {
        const result = await fcl.send([
            fcl.script(readAccountSells),
            fcl.args([
                fcl.arg(address, types.Address),
            ])
        ]).then(fcl.decode)
        setMyNftOnSale(result);
        console.log(result);
    }

    const getNFTsonSale = async () => {
        const result = await fcl.send([
            fcl.script(readAccountSells),
            fcl.args([
                fcl.arg("0xdf202fd6391aaf5d", types.Address),
            ])
        ]).then(fcl.decode)
        setNftOnSale(result);
        nftOnSaleAux = result;
        console.log(result);
    }

    const getDetailsOfOneNFTOnSale = async (id, addressForSale) => {
        const result = await fcl.send([
            fcl.script(getDetails),
            fcl.args([
                fcl.arg(addressForSale, types.Address),
                fcl.arg(id, types.UInt64),
            ])
        ]).then(fcl.decode)
        
        if (addressForSale !== "0xdf202fd6391aaf5d") {
            nftDetail.push(result);
            if (nftDetail.length >= myNftOnSale.length) {
                setRender(true);
            }
        } else {
            if((new Date(result.expiry * 1000)) < (new Date())) {
                nftOnSaleAux = nftOnSaleAux.filter(item => item != id);
                if (nftDetail.length >= nftOnSale.length) {
                    setNftOnSale(nftOnSaleAux);
                }
            }
        }

        console.log("detalle del nft en venta", result);
    }

    //saleItemID: UInt64, saleItemPrice: UFix64, customID: String?, commissionAmount: UFix64
    const SellNFT = async (id) => {
        const transactionId = await fcl.send([
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
            fcl.limit(9999)
        ]).then(fcl.decode);

        console.log(transactionId);

        return fcl.tx(transactionId).onceSealed();
    }

    useEffect(() => {
        if (address) {
            getNFTs();
        }
    }, [address])

    useEffect(() => {
        if (myNftOnSale.length)
            myNftOnSale.forEach(nft => {
                getDetailsOfOneNFTOnSale(nft, address);
            })
    }, [myNftOnSale]);

    useEffect(() => {
        if (nftOnSale.length)
            nftOnSale.forEach(nft => {
                getDetailsOfOneNFTOnSale(nft, "0xdf202fd6391aaf5d");
            })
    }, [nftOnSale]);

    const RenderSell = (nftId) => {
        return { status: !nftDetail.find(f => f.nftID == nftId) }
    }

    return (
        <div style={{
            overflow: "scroll", 
            width: "100%", 
            display: "grid" 
        }}>
            <h3>
                {address ? "My NFTS" : null}
            </h3>
            <div style={{
                "display": "flex",
                "gap": "20px",
                "margin-bottom": "20px",
            }}>
                {
                    collection && address && collection.length ? collection.map((nft, index) =>
                    (<div key={index} id={nft} style={{
                            "width": "250px",
                            "height": "250px",
                            "position": "relative",
                            "background": "#c3c3c3",
                            "borderRadius": "5px",
                        }}>
                            <Image src={"/placeholder.png"} fill alt='placeholder' />
                            <div style={{
                                "position": "absolute",
                                "width": "100%",
                                "bottom": "0",
                                "left": "0",
                            }}
                            >
                            { render && RenderSell(nft).status
                                ? <button
                                onClick={() => SellNFT(nft)}
                                style={{
                                    "width": "100%",
                                    "color": "white",
                                    "padding": "10px",
                                    "cursor": "pointer",
                                }}> Sell NFT ({nft}) </button>
                                : null
                            }
                            </div>
                        </div>
                        )
                    )
                        : null
                }
            </div>
            <button style={{"max-width": "100px", "margin-bottom": "20px"}} onClick={() => getNFTsonSale()}>
                get nft on sale
            </button>
            {<p> {nftOnSale.join(", ")} </p>}

        </div>
    )
}
