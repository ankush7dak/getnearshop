import HamburgerMenu from "../../../Hamburgers/HamburgerMenu";
import "./NearShopNavBar.css";

export default function NearShopNavBar() {
  return (
    <header className="nearshop-navbar">
      <div className="nearshop-nav-inner">
        {/* BRAND */}
        <HamburgerMenu></HamburgerMenu>
        <div className="nav-brand">NearShop</div>

        {/* SEARCH */}
       
      </div>
    </header>
  );
}
