import React from 'react';
import { Link } from "react-router-dom";
import all_items from "../assets/all_Items.jpg";
import bg from "../assets/bg.jpg";
import x from "../assets/x.jpg";
import "../styles/welcome.css";

export const Welcome = () => {
    return (
        <div className='containerr' style={{ height: "100%", width: "100%", backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }} >
            <div className='cardd' >
                <h1 style={{ fontFamily: "myFont", color: "black", fontSize: "70px", fontWeight: "bold" }} > Delve into VINTAGE VAULT.</h1>
                <h1 style={{ fontFamily: "jogan", color: "black", fontSize: "45px", fontWeight: "bold" }}> Preserving memories, so future fam digs the vintage world vibe! 📦🌏✨</h1>
                <img src={x} style={{ borderRadius: "200px", width: "400px", height: "400px" }} />
            </div>
            <div className='buttonn'>
                <Link to="/register">  <button style={{ paddingTop: "9px", fontWeight: "bold", width: "530px", height: "50px", fontFamily: "myFont", fontSize: "30px" }}> Start your Journey by clicking here. </button> </Link>
            </div>
        </div>
    )
}