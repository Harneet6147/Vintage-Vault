import React from 'react';
import vault from "../assets/vault.avif";
import { useState, useEffect } from 'react';
import Tilt from "react-parallax-tilt";
import "../styles/listed.css";
import axios from 'axios';
import { ethers } from 'ethers';
import VintageVault from '../ethereum/VintageVault';

export const Vault = () => {
    const [relicCards, setRelicCards] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState("");
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();

        const getRelics = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract_instance = VintageVault(provider);
                let temp = await contract_instance.getVaultRelics();
                setRelicCards(temp);
                // console.log(temp);
                let promises_tokenURI = [];
                for (const _relicCard of relicCards) {
                    let _tokenID = _relicCard.tokenID.toNumber();
                    let prom = await contract_instance.getRelicData(_tokenID);
                    promises_tokenURI.push(prom);
                }
                let promises_tokenURI_resolve = await Promise.all(promises_tokenURI);
                // console.log(promises_tokenURI_resolve);

                let promises_token_CID = [];
                for (const _tokenURI of promises_tokenURI_resolve) {
                    const resp = await axios({
                        method: "get",
                        maxBodyLength: Infinity,
                        url: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${_tokenURI}`,
                        headers: {
                            Accept: "application/json",
                        }
                    });
                    promises_token_CID.push(resp);
                }

                // Here we get 2 CID's for the Relic Token
                let promises_token_CID_resolve = await Promise.all(promises_token_CID);
                // console.log(promises_token_CID_resolve);

                let promises_token_Data_CID_Details = [];
                let relic_pic_details = [];

                for (const relicCID of promises_token_CID_resolve) {
                    let _relicDetails = relicCID.data.RelicDetails;
                    let _relicPicture = relicCID.data.RelicPicture;

                    let detail_promise = await axios({
                        method: "get",
                        maxBodyLength: Infinity,
                        url: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${_relicDetails}`,
                        headers: {
                            Accept: "application/json",
                        }
                    });
                    promises_token_Data_CID_Details.push(detail_promise);
                    relic_pic_details.push(`https://tomato-near-puma-781.mypinata.cloud/ipfs/${_relicPicture}`);
                }
                let promises_token_Data_CID_Details_resolve = await Promise.all(promises_token_Data_CID_Details);
                // console.log("First", promises_token_Data_CID_Details_resolve);
                let finalTokens = [];

                promises_token_Data_CID_Details_resolve.map((_relicCard, index) => {
                    finalTokens.push({
                        "relicName": _relicCard.data.RelicName,
                        "description": _relicCard.data.Description,
                        "picURL": relic_pic_details[index],
                        "tokenID": relicCards[index].tokenID,
                        "price": relicCards[index].price,
                        "relicSeller": relicCards[index].seller
                    })
                });
                finalTokens.map((token) => {
                    console.log("Token:", token);
                    console.log(ethers.utils.formatEther(token.price));
                })
                setTokens(finalTokens);
                tokens.map((token) => {
                    console.log("Token:", token);
                    console.log(ethers.utils.formatEther(token.price));
                })
            } catch (error) {
                console.log(error);
            }
        }
        getRelics();
    }, [walletAddress, relicCards, tokens]);

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                setSigner(provider.getSigner());

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    // console.log(accounts[0]);
                } else {
                    console.log("Connect to MetaMask using the Connect button");
                }
            } catch (err) {
                console.error(err.message);
            }
        } else {
            /* MetaMask is not installed */
            console.log("Please install MetaMask");
        }
    };

    const addWalletListener = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            window.ethereum.on("accountsChanged", (accounts) => {
                setWalletAddress(accounts[0]);
                // console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    const buyRelic = async (event, _tokenID, _price) => {
        try {
            let contract_instance = VintageVault(signer);
            await contract_instance.buyNFT(_tokenID, { value: ethers.utils.parseEther(_price) });
        } catch (error) {
            alert("ERROR:", error);
        }
    }

    const renderCards = tokens.map((relicCard, index) => (
        <div className="cardd_listed">
            <img src={relicCard.picURL} />
            <h2> {relicCard.relicName}  </h2>
            <p> {relicCard.description} </p>
            <p style={{ fontWeight: "bold" }} > Price:{relicCard.price.toNumber()} ETH </p>
            <button disabled={relicCard.relicSeller === walletAddress} onClick={(event) => buyRelic(event, relicCard.tokenID.toNumber(), relicCard.price.toString())} style={{ fontSize: "20px", background: "transparent", border: "0.1px solid black", fontFamily: "myFont", fontSize: "25px", paddingTop: "8px" }}> Buy Relic </button>
        </div >
    ));

    return (
        <div style={{ backgroundImage: `url(${vault})`, backgroundSize: "cover", backgroundPosition: "center", height: "100vh", width: "100vw" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                <div className='profileStats_dp'>
                    <h1 style={{ color: "black", fontFamily: "jogan", fontSize: "60px", fontWeight: "bolder" }} > Relics Vault </h1>
                </div>
            </div>
            <div className='containerr_listed'>
                {renderCards}
            </div>
        </div>
    )
}