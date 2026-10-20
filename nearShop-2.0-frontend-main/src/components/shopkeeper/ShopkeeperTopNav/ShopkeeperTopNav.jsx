import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaUserCircle,
  FaStore,
  FaPowerOff,
} from "react-icons/fa";
import "./ShopkeeperTopNav.css";
import HamburgerMenu from "../../Hamburgers/HamburgerMenu";
import Logout from "../../LoginSignup/Logout";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";

export default function ShopkeeperTopNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopopen,setShopopen] = useState(null);
  const [shopname,setShopname] = useState('');
  const dropdownRef = useRef(null);

  const fetchNavData = async ()=>{
    const res = await axios.get(`${LINKS.API_BASE_URL}/api/shop/getNavData`,{
      withCredentials:true
    }
    );
    console.log(res.data);
    setShopname(res.data.shopName);
    setShopopen(res.data.isActive);

  }

  useEffect(()=>{
    fetchNavData();
  },[]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sk-topnav">

      {/* LEFT */}
      <HamburgerMenu></HamburgerMenu>
      <div className="sk-topnav-left">
        <FaStore className="logo-icon" />
        <h2>{shopname} </h2>
      </div>

      {/* RIGHT */}
      
      <div className="sk-topnav-right">

        {/* SHOP STATUS */}
        {      shopopen == true ?  <button className="shop-status-btn open">Open</button>:        <button className="shop-status-btn closed">Closed</button>
}

        {/* NOTIFICATIONS */}
        <Link to="/shopkeeper/notifications" className="icon-btn">
          <FaBell />
          <span className="badge">3</span>
        </Link>

        {/* PROFILE */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <button
            className="profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <FaUserCircle />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <Link to="/shopkeeper/profile">My Profile</Link>
              <Link to="/shopkeeper/shop">Shop Settings</Link>
              <Link to="/shopkeeper/bank">Bank Details</Link>
              <hr />
                 <Logout></Logout>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
