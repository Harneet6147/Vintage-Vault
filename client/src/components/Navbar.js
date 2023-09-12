import { Link } from "react-router-dom";
export const Navbar = () => {
    return (
        <nav className="navbar bg-dark" data-bs-theme="dark" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px" }}>
            <Link to="/vault" > <button style={{ fontFamily: "jogan", fontSize: "25px" }} >Vault </button> </Link >
            <Link to="/listed"> <button style={{ fontFamily: "jogan", fontSize: "25px" }} >Listed </button> </Link>
            <Link to="/owned"> <button style={{ fontFamily: "jogan", fontSize: "25px" }}>Owned   </button> </Link>
            <Link to="/dashBoard"><button style={{ fontFamily: "jogan", fontSize: "25px" }}>DashBoard </button>  </Link>
            <Link to="/register">  <button style={{ fontFamily: "jogan", fontSize: "25px" }}> Register</button> </Link>
        </nav >
    )
}