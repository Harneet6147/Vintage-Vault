import React from 'react';
import login from "../assets/login.jpg";
import { useState, useEffect } from 'react';
import "../styles/register.css";
import { ethers } from "ethers";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VintageVault from '../ethereum/VintageVault';

export const Register = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [userID, setUserID] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState("");
    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
    }, [walletAddress]);

    const connectWallet = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
                /* MetaMask is installed */
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);

                setSigner(provider.getSigner());

                // setlInContract(LinkedInContract(provider));

                setWalletAddress(accounts[0]);
                setUserID(accounts[0]);
                console.log(accounts[0]);
            } catch (err) {
                console.error(err.message);
            }
        } else {
            /* MetaMask is not installed */
            console.log("Please install MetaMask");
        }
    };

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                setSigner(provider.getSigner());

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setUserID(accounts[0]);
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
                setUserID(accounts[0]);
                console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    const handleChange_UserName = async (event) => {
        setUserName(event.target.value);
        // console.log(userName);
    }
    const submit_userData = async (event) => {
        event.preventDefault();

        const formData = JSON.stringify({
            "pinataMetadata": {
                name: "User Name"
            },
            "pinataContent": {
                "UserName": userName,
                "UserId": userID
            }
        });

        try {
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: formData,
                headers: {
                    pinata_api_key: `your key`,
                    pinata_secret_api_key: `your key`,
                    "Content-Type": "application/json",
                },
            });
            const DataHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(`Data Hash: ${DataHash}`);
            // console.log(resFile.data.IpfsHash);

            const contract_instance = VintageVault(signer);
            await contract_instance.createUser(resFile.data.IpfsHash, userID);
            alert("Registration is Successfull!");
            navigate("/dashBoard");


        } catch (error) {
            console.log(error);
            alert("Error in Register");
        }

    }

    return (
        <div style={{ backgroundImage: `url(${login})`, backgroundSize: "cover", backgroundPosition: "center", height: "100vh", width: "100vw" }} >
            <div style={{ display: "flex", justifyContent: "right" }}>
                <button onClick={connectWallet} style={{ width: "300px", height: "60px", position: "relative", fontFamily: "myFont", paddingTop: "10px", fontSize: "40px", fontWeight: "90px", marginTop: "5px", marginRight: "25px", backgroundColor: "gray" }} > Connect Wallet </button>
            </div>
            <div className="form-box">
                <div className="form-value">
                    <form action="">
                        <h2 style={{ fontSize: "44px", fontFamily: "myFont", color: "black", fontWeight: "bold" }} >Step back in time, embrace vintage !</h2>
                        <div className="inputbox">
                            <ion-icon name="mail-outline"></ion-icon>
                            <input type="username" onChange={handleChange_UserName} required />
                            <label htmlFor="" >UserName</label>
                        </div>
                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input required value={userID} />
                            <label htmlFor=""> UserID</label>
                        </div>
                        <button onClick={submit_userData} type={'submit'} style={{ background: "transparent", border: "0.1px solid #ffff", fontFamily: "myFont", fontWeight: "bold", width: "250px", fontSize: "30px", paddingTop: "13px" }} > Register </button>
                    </form>
                </div>
            </div>
        </div>
    )
}