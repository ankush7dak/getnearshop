import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaShoppingCart, FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./NavBar.css";
import HamburgerMenu from "../../Hamburgers/HamburgerMenu";

export default function NavBar({ data }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="navbar">
      {data && (
        <div className="navbar-inner">
          {/* LEFT */}
          <div className="navbar-left">
            <HamburgerMenu />

            <Link to="/" className="logo">
              {data.name}
            </Link>
          </div>

          {/* CENTER SEARCH */}
          <div className="navbar-search">
            <input type="text" placeholder="Search shops, products..." />
          </div>

          {/* RIGHT */}
          <div className="navbar-right">
            <Link to="/cart" className="icon-btn">
              <FaShoppingCart />
              <span className="badge">2</span>
            </Link>

            <Link to="/notifications" className="icon-btn">
              <FaBell />
              <span className="badge">5</span>
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
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/cart">My Cart</Link>
                  <Link to="/saved">Saved Shops</Link>
                  <Link to="/notifications">Notifications</Link>
                  <Link to="/help">Help & Support</Link>
                  <hr />
                  <button className="logout-btn">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
