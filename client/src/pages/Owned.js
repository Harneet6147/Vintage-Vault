import { useState, useEffect } from 'react';
import ownedbg from "../assets/testing.jpg";
import Tilt from "react-parallax-tilt";
import "../styles/owned.css";
import axios from 'axios';
import { ethers } from 'ethers';
import VintageVault from '../ethereum/VintageVault';

export const Owned = () => {
    const [relicCards, setRelicCards] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState("");
    const [tokens, setTokens] = useState([]);
    const [lisingPrice, setListingPrice] = useState("");

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();

        const getRelics = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract_instance = VintageVault(provider);
                let temp = await contract_instance.getOwnedRelics(walletAddress);
                setRelicCards(temp);
                // console.log(relicCards);
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
                        "tokenID": relicCards[index].tokenID
                    })
                });
                // finalTokens.map((token) => {
                //     console.log("Token:", token);
                // })
                setTokens(finalTokens);
            } catch (error) {
                console.log(error);
            }
        }
        getRelics();
    }, [walletAddress, relicCards, tokens]);

    const handle_listing_price = (event) => {
        setListingPrice(event.target.value);
        // console.log(lisingPrice);
    }

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

    const listRelic = async (event, _tokenID) => {

        try {
            let contract_instance = VintageVault(signer);
            await contract_instance.listNFT(_tokenID, lisingPrice);
        } catch (error) {
            alert("ERROR:", error);
        }


    }


    const renderCards = tokens.map((relicCard, index) => (
        < Tilt key={index} >
            <div className="cardd_owned">
                <img src={relicCard.picURL} />
                <h2> {relicCard.relicName}  </h2>
                <p> {relicCard.description} </p>
                <input onChange={handle_listing_price} style={{ fontSize: "20px", fontFamily: "myFont" }} type='text' placeholder='Enter price (ETH)' />
                <button onClick={(event) => listRelic(event, relicCard.tokenID.toNumber())} style={{ fontSize: "20px", color: "black", background: "transparent", border: "0.1px solid #ffff", fontFamily: "myFont", fontSize: "25px", paddingTop: "8px" }}> List Relic for Sale </button>
            </div>
        </Tilt>
    ));

    return (
        <div style={{ backgroundImage: `url(${ownedbg})`, backgroundSize: "cover", backgroundPosition: "center", height: "100vh", width: "100vw" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                <div className='profileStats_dp_owned'>
                    <h1 style={{ color: "white", fontFamily: "jogan", fontSize: "60px", fontWeight: "bolder" }} > Owned Relics </h1>
                </div>
            </div>

            <div className='containerr_owned'>
                {renderCards}
            </div>
        </div>
    )

}