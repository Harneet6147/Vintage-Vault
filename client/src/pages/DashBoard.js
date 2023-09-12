import React from 'react';
import { useState, useEffect } from 'react';
import dashboard from "../assets/all_Items.jpg";
import "../styles/dashboard.css";
import dp from "../assets/dp.png";
import { BigNumber, ethers } from 'ethers';
import axios from 'axios';
import VintageVault from '../ethereum/VintageVault';



export const DashBoard = () => {
    const [userName, setUserName] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState("");
    const [relicName, setRelicName] = useState("");
    const [description, setDescription] = useState("");
    const [relicPic, setRelicPic] = useState(null);
    const [ownedNumber, setOwnedNumber] = useState([]);
    const [listedNumber, setListedNumber] = useState([]);

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();

        const getDashboardInfo = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                let contract_instance = VintageVault(provider);
                let temp = await contract_instance.dashBoard(walletAddress);
                let _listedNumber = await contract_instance.getListedRelics(walletAddress);
                let _ownedNumber = await contract_instance.getOwnedRelics(walletAddress);
                setListedNumber(_listedNumber);
                setOwnedNumber(_ownedNumber);
                let _cid = temp.cid;
                const resp = await axios({
                    method: "get",
                    maxBodyLength: Infinity,
                    url: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${_cid}`,
                    headers: {
                        Accept: "application/json",
                    }
                });
                setUserName(resp.data.UserName);
            } catch (error) {
                console.log(error);
            }
        }
        getDashboardInfo();
    }, [walletAddress, userName, ownedNumber, listedNumber]);

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                setSigner(provider.getSigner());

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    console.log(accounts[0]);
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
                console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    const handleChange_name = async (event) => {
        setRelicName(event.target.value);
    }
    const handleChange_narrative = async (event) => {
        setDescription(event.target.value);
    }
    const handleChange_dp = async (event) => {
        const dp_file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(dp_file);
        reader.onloadend = () => {
            setRelicPic(event.target.files[0]);
        }
        console.log(relicPic);
    }
    const submit_data = async (event) => {
        event.preventDefault();

        let relic_detail_hash = "";
        let relic_pic_hash = "";
        let relic_NFT_hash = "";

        // 1.)   Relic Details
        const formData = JSON.stringify({
            "pinataMetadata": {
                name: "Relic Details"
            },
            "pinataContent": {
                "RelicName": relicName,
                "Description": description,
            }
        });
        try {
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: formData,
                headers: {
                    pinata_api_key: `Your key`,
                    pinata_secret_api_key: `your key`,
                    "Content-Type": "application/json",
                },
            });
            const DataHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(`Data Hash: ${DataHash}`);
            // console.log(resFile.data.IpfsHash);
            relic_detail_hash = resFile.data.IpfsHash;
            // console.log(relic_detail_hash);
            alert("Successfully uploaded Relic Details!");



        } catch (error) {
            console.log(error);
            alert("Error in Uploadoing relic details!");
        }
        // **********************************************************************************************************//
        // 2.) Relic picture

        const formData_2 = new FormData();
        formData_2.append("file", relicPic);
        try {
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData_2,
                headers: {
                    pinata_api_key: `your key`,
                    pinata_secret_api_key: `your key`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(`Image Hash: ${ImgHash}`);
            // console.log(resFile.data.IpfsHash);
            relic_pic_hash = resFile.data.IpfsHash;
            // console.log(relic_pic_hash);
            alert("Relic Pic Uploaded Successfully!");

        } catch (error) {
            console.log(error);
            alert("Error in uploading Relic pic");
        }

        // **********************************************************************************************************//
        // Relic NFT
        const RelicData = JSON.stringify({
            "pinataMetadata": {
                name: "Relic NFT"
            },
            "pinataContent": {
                "RelicDetails": relic_detail_hash,
                "RelicPicture": relic_pic_hash,
            }
        });
        try {
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: RelicData,
                headers: {
                    pinata_api_key: `759e9d17288f9e86a95a`,
                    pinata_secret_api_key: `77907a50a2220e06ba0a0efe9486e32ad6aed6d8bf2e916df1ae91d25d115b97`,
                    "Content-Type": "application/json",
                },
            });
            const DataHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(`Relic NFT Hash: ${DataHash}`);
            // console.log(resFile.data.IpfsHash);
            relic_NFT_hash = resFile.data.IpfsHash;
            // console.log(relic_NFT_hash);

            let contract_instance = VintageVault(signer);
            await contract_instance.createNFT(relic_NFT_hash);
            contract_instance.on("NFTTransfer", (tokenID, from, to, tokenURI, price) => {

                let e = {
                    id: tokenID.toString(),
                    from: from,
                    to: to,
                    price: price.toString(),
                    Cid: tokenURI,
                };
                console.log(JSON.stringify(e, null, 5))
            })

            alert("Relic NFT minted!");
        } catch (error) {
            console.log(error);
            alert("Error in Register");
        }

    }

    return (
        <div style={{ backgroundImage: `url(${dashboard})`, backgroundPosition: "center", height: "100%", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                <div className='profileStats_dp'>
                    <h1 style={{ color: "white", fontFamily: "jogan", fontSize: "60px", fontWeight: "bolder" }} > User Control Panel </h1>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="form-boxx">
                    <div className="form-value">
                        <form action="">
                            <h2 style={{ color: "white", fontFamily: "myFont", fontSize: "50px", fontWeight: "bold" }} >Mint your Relic</h2>
                            <div className="inputboxx">
                                <ion-icon name="lock-closed-outline"></ion-icon>
                                <input onChange={handleChange_name} />
                                <label htmlFor=""> Name </label>
                            </div>
                            <div className="inputboxx">
                                <ion-icon name="lock-closed-outline"></ion-icon>
                                <input required onChange={handleChange_narrative} />
                                <label htmlFor=""> Narrative</label>
                            </div>
                            <div className="inputboxx">
                                <ion-icon name="lock-closed-outline"></ion-icon>
                                <input required style={{ borderRadius: "50px", background: "transparent", color: "lightblue" }} type="file" onChange={handleChange_dp} />
                            </div>
                            <button type={'submit'} onClick={submit_data} style={{ paddingTop: "12px", width: "100px", color: "white", background: "transparent", fontFamily: "myFont", fontSize: "30px" }} > MINT </button>
                        </form>
                    </div>
                </div>
                <div className='profileStats' >
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", marginLeft: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
                            <img src={dp} style={{ height: "200px", borderRadius: "100px" }} />
                            <h2 style={{ fontFamily: "myFont", fontSize: "70px" }}> {userName} </h2>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <p style={{ color: "white", fontFamily: "myFont", fontSize: "35px" }}> Wallet Address: {walletAddress} </p>
                            <p style={{ color: "white", fontFamily: "myFont", fontSize: "35px" }}> Owned Relics:  {ownedNumber.length} </p>
                            <p style={{ color: "white", fontFamily: "myFont", fontSize: "35px" }}> Listed Relics:  {listedNumber.length} </p>
                        </div>

                    </div>
                </div>
            </div>

            <div style={{ opacity: "0" }}> Hello </div>
        </div>
    )
}