import abi from "./abi.json";
import { ethers } from "ethers";

const VintageVault = (provider) => {

    return new ethers.Contract(
        "0x47da922Ca9B4302388D3D207F1EE3289d13a7302",
        abi,
        provider
    );
}

export default VintageVault;