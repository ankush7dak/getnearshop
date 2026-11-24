import { Outlet } from "react-router-dom";
import HamburgerMenu from "../../../Hamburgers/HamburgerMenu";
import "./NearShopNavBar.css";
import JoinShopQR from "../../CustomerJoinShop/JoinShopQR";

export default function NearShopNavBar() {
  return (
    <>
    <header className="nearshop-navbar">
      <div className="nearshop-nav-inner">
        {/* BRAND */}
        <HamburgerMenu></HamburgerMenu>
        <JoinShopQR></JoinShopQR>

        {/* <div className="nav-brand">getNearShop</div> */}
        {/* SEARCH */}
       
      </div>
    </header>
    <Outlet></Outlet>
    </>
  );
}
