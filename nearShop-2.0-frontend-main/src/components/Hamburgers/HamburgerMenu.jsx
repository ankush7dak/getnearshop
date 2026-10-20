
import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HamburgerMenu.css";
import { HOME_BY_ROLE } from "../../constants/HomeByRole";
import { AuthContext } from "../../contexts/authcontext/AuthProvider";
import Logout from "../LoginSignup/Logout";

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const role = user;

  const menuItems = {
    customer: [
      { name: "Home", path: HOME_BY_ROLE.customer },
      // { name: "Subscribed Shops", path: "/customer/visited-shops" },
      { name: "My Cart", path: "/customer/cart" },
      { name: "My Orders", path: "/customer/orders" },
      { name: "My Profile", path: "/customer/profile" },
      { name: "Notifications", path: "/customer/notifications" },
      { name: "Logout", path: "/login" },
    ],

    shopkeeper: [
      { name: "Home", path: HOME_BY_ROLE.shopkeeper },
      { name: "Products", path: "/shopkeeper/inventory" },
      { name: "My Customers", path: "/shopkeeper/mycustomers" },
      { name: "Orders", path: "/shopkeeper/orders" },
      { name: "Profile", path: "/shopkeeper/profile" },
      { name: "Logout", path: "/login" },
    ],

    superadmin: [
      { name: "Dashboard", path: "/" },
      { name: "Users", path: "/users" },
      { name: "Shops", path: "/shops" },
      { name: "Reports", path: "/reports" },
      { name: "Logout", path: "/login" },
    ],
  };

  const items = menuItems[role] || [];

  const closeMenu = () => setOpen(false);

  const renderMenuItem = (item) => {
    if (item.name === "Logout") {
      return (
        <span className="navbar-logout">
          <Logout />
        </span>
      );
    }

    return (
      <Link
        to={item.path}
        className={
          location.pathname === item.path
            ? "navbar-link active"
            : "navbar-link"
        }
        onClick={closeMenu}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="responsive-navbar">
      {/* Desktop and tablet navbar */}
      <div className="desktop-nav">
        <ul>
          {items.map((item) => (
            <li key={item.name}>{renderMenuItem(item)}</li>
          ))}
        </ul>
      </div>

      {/* Mobile hamburger button */}
      <button
        type="button"
        className={`hamburger-icon ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <div
        id="mobile-menu"
        className={`menu-overlay ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <ul>
          {items.map((item) => (
            <li key={item.name} onClick={closeMenu}>
              {renderMenuItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default HamburgerMenu;
