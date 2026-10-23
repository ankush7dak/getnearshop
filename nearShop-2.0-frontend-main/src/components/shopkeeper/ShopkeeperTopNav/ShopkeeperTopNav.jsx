
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaUserCircle,
  FaStore,
} from "react-icons/fa";
import axios from "axios";

import "./ShopkeeperTopNav.css";
import HamburgerMenu from "../../Hamburgers/HamburgerMenu";
import Logout from "../../LoginSignup/Logout";
import { LINKS } from "../../../constants/LinksUtility";

export default function ShopkeeperTopNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(null);
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);

  // Fetch shop name and status
  useEffect(() => {
    const controller = new AbortController();

    const fetchNavData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${LINKS.API_BASE_URL}/api/shop/getNavData`,
          {
            withCredentials: true,
            signal: controller.signal,
          }
        );

        const data = response.data;

        console.log("Shop navigation data:", data);

        setShopName(data?.shopName ?? "");

        // Handle boolean or string responses
        const active = data?.isActive;
        setShopOpen(
          active === true ||
          active === "true" ||
          active === 1
        );
      } catch (error) {
        if (
          error.code !== "ERR_CANCELED" &&
          error.name !== "CanceledError"
        ) {
          console.error(
            "Failed to fetch shop navigation data:",
            error.response?.data || error.message
          );

          setShopName("");
          setShopOpen(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNavData();

    return () => controller.abort();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="sk-topnav">
      {/* LEFT: SHOP NAME AND STATUS */}
      <div className="sk-topnav-left">
        <FaStore className="logo-icon" />

        <h2 className="shopname">
          {loading
            ? "Loading shop..."
            : shopName || "My Shop"}
        </h2>

        {!loading && (
          <>
            {shopOpen === true && (
              <button
                type="button"
                className="shop-status-btn open"
              >
                Open
              </button>
            )}

            {shopOpen === false && (
              <button
                type="button"
                className="shop-status-btn closed"
              >
                Closed
              </button>
            )}

            {shopOpen === null && (
              <button
                type="button"
                className="shop-status-btn closed"
                disabled
              >
                Status unavailable
              </button>
            )}
          </>
        )}
      </div>

      {/* HAMBURGER MENU */}
      <HamburgerMenu />

      {/* RIGHT: NOTIFICATIONS AND PROFILE */}
      <div className="sk-topnav-right">
        <Link
          to="/shopkeeper/notifications"
          className="icon-btn"
          aria-label="Notifications"
        >
          <FaBell />
          <span className="badge">3</span>
        </Link>

        {/* PROFILE DROPDOWN */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="profile-btn"
            onClick={() =>
              setProfileOpen((previous) => !previous)
            }
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            <FaUserCircle />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <Link
                to="/shopkeeper/profile"
                onClick={() => setProfileOpen(false)}
              >
                My Profile
              </Link>

              <Link
                to="/shopkeeper/shop"
                onClick={() => setProfileOpen(false)}
              >
                Shop Settings
              </Link>

              <Link
                to="/shopkeeper/bank"
                onClick={() => setProfileOpen(false)}
              >
                Bank Details
              </Link>

              <hr />

              <Logout />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
