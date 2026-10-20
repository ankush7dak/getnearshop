import React, { useEffect, useState } from "react";
import "./ShopkeeperDashboard.css";
import {
  FaShoppingBag,
  FaClipboardList,
  FaRupeeSign,
  FaBoxes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import { LINKS } from "../../../constants/LinksUtility";
import axios from "axios";


export default function ShopkeeperDashboard() {
const [productCount,setProductCount] = useState(0);
  const fetchDashboardData = async ()=>{
    try {
      const response = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getDashboardData`,
        { withCredentials: true }
      );

      console.log("categories", response.data);
      setProductCount(response.data.productCount);

    } catch (e) {
      console.log("error", e);
    }
  }
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
    <ShopkeeperTopNav></ShopkeeperTopNav>
    <div className="sk-dashboard">

      {/* HEADER */}
      <div className="sk-dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back 👋 Here’s today’s overview</p>
      </div>

      {/* STATS GRID */}
      <div className="sk-stats-grid">
        <StatCard
          icon={<FaClipboardList />}
          title="New Orders"
          value="12"
          link="/shopkeeper/orders"
        />
        <StatCard
          icon={<FaShoppingBag />}
          title="Total Products"
          value={productCount}
          link="/shopkeeper/inventory"
        />
        <StatCard
          icon={<FaBoxes />}
          title="Low Stock"
          value="8"
          danger
          link="/shopkeeper/stocks"
        />
        <StatCard
          icon={<FaRupeeSign />}
          title="Today’s Revenue"
          value="₹4,520"
        />
        
        
      </div>

      {/* QUICK ACTIONS */}
      <div className="sk-quick-actions">
        <h3>Quick Actions</h3>

        <div className="sk-actions-grid">
          <Link to="/shopkeeper/orders" className="sk-action-card">
            📦 Manage Orders
          </Link>

          <Link to="/shopkeeper/add-products" className="sk-action-card">
            🛒 Add Products
          </Link>

          <Link to="/shopkeeper/inventory" className="sk-action-card">
            📊 Inventory
          </Link>

          <Link to="/shopkeeper/profile" className="sk-action-card">
            🏪 Shop Profile
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}

/* -------------------------------- */

function StatCard({ icon, title, value, link, danger }) {
  const Wrapper = link ? Link : "div";

  return (
    <Wrapper
      to={link}
      className={`sk-stat-card ${danger ? "danger" : ""}`}
    >
      <div className="sk-stat-icon">{icon}</div>

      <div className="sk-stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </Wrapper>
  );
}
