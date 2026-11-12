
import { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  FaUserCircle,
  FaStore,
} from "react-icons/fa";
import axios from "axios";

import "./ShopkeeperTopNav.css";
import HamburgerMenu from "../../Hamburgers/HamburgerMenu";
import Logout from "../../LoginSignup/Logout";
import { LINKS } from "../../../constants/LinksUtility";
import { useCustomer } from "../../customer/CustomerContext/CustomerContext";

export default function ShopkeeperTopNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(null);
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const {currShopName,shopActive} = useCustomer();
  const dropdownRef = useRef(null);

  // Fetch shop name and opening status
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

        setShopName(data?.shopName ?? "");

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
          console.error("Failed to fetch shop data:", error);

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
  }, [shopActive,currShopName]);

  // Toggle shop open/closed status
  const handleShopStatusToggle = async () => {
    if (shopOpen === null || updatingStatus) return;

    const previousStatus = shopOpen;
    const newStatus = !previousStatus;

    try {
      setUpdatingStatus(true);

      // Update status in backend
      const response = await axios.post(
        `${LINKS.API_BASE_URL}/api/shop/updateShopStatus`,
        {
          
        },
        {
          withCredentials: true,
          params : {isActive: newStatus}
        }
      );

      // Update UI after successful API response
      setShopOpen(
        response.data?.isActive ?? newStatus
      );

    } catch (error) {
      console.error(
        "Failed to update shop status:",
        error.response?.data || error.message
      );

      // Restore previous status
      setShopOpen(previousStatus);

      alert(
        error.response?.data?.message ||
        "Unable to update shop status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Close profile dropdown on outside click
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
    <>
      <header className="sk-topnav">

        <HamburgerMenu />

        {/* LEFT: SHOP NAME AND STATUS */}
        <div className="sk-topnav-left">

          {/* <FaStore className="logo-icon" /> */}

          {/* <h2 className="shopname">
            {loading
              ? "Loading shop..."
              : shopName || "My Shop"}
          </h2> */}

          {/* SHOP STATUS TOGGLE */}
          {!loading && (
            <div className="shop-status-container">

              <span
                className={`shop-status-label ${
                  shopOpen ? "open" : "closed"
                }`}
              >
                {shopOpen === null
                  ? "Unavailable"
                  : shopOpen
                  ? "Open"
                  : "Closed"}
              </span>

              <button
                type="button"
                className={`shop-status-toggle ${
                  shopOpen ? "is-open" : "is-closed"
                }`}
                onClick={handleShopStatusToggle}
                disabled={
                  shopOpen === null || updatingStatus
                }
                role="switch"
                aria-checked={shopOpen === true}
                aria-label="Toggle shop opening status"
                title={
                  shopOpen
                    ? "Click to close shop"
                    : "Click to open shop"
                }
              >
                <span className="shop-status-toggle-circle">
                  {updatingStatus && (
                    <span className="status-spinner" />
                  )}
                </span>
              </button>

              {updatingStatus && (
                <span className="status-saving">
                  Updating...
                </span>
              )}

            </div>
          )}

        </div>
        {/* <FaStore className="logo-icon" /> */}
        <h2 className="shopname">
            {loading
              ? "Loading shop..."
              : shopName || "My Shop"}
          </h2>
        <FaStore className="logo-icon" />

        {/* RIGHT: PROFILE */}
        {/* <div className="sk-topnav-right">

          <div
            className="profile-wrapper"
            ref={dropdownRef}
          >
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

                <hr />

                <Logout />

              </div>
            )}
          </div>

        </div> */}

      </header>

      <Outlet />
    </>
  );
}
