
import React, { useEffect, useState } from "react";
import "./ShopkeeperDashboard.css";

import {
  FaShoppingBag,
  FaClipboardList,
  FaRupeeSign,
  FaBoxes,
  FaArrowRight,
  FaStore,
  FaPlus,
  FaChartLine
} from "react-icons/fa";

import { Link } from "react-router-dom";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import { LINKS } from "../../../constants/LinksUtility";
import axios from "axios";

export default function ShopkeeperDashboard() {
  const [productCount, setProductCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getDashboardData`,
        {
          withCredentials: true
        }
      );

      console.log("Dashboard data:", response.data);

      setProductCount(response.data.productCount || 0);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <ShopkeeperTopNav />

      <main className="sk-dashboard">
        {/* HEADER */}

        <header className="sk-dashboard-header">
          <div className="sk-dashboard-heading">
            <div className="sk-dashboard-heading-icon">
              <FaChartLine />
            </div>

            <div>
              <h2>Dashboard</h2>

              <p>
                Welcome back! Here's your shop overview.
              </p>
            </div>
          </div>

          <div className="sk-dashboard-status">
            <span className="sk-status-dot" />
            Shopkeeper Dashboard
          </div>
        </header>

        {/* STATS GRID */}

        <section className="sk-stats-section">
          <div className="sk-section-heading">
            <div>
              <h3>Business Overview</h3>

              <p>
                Track your shop's performance at a glance.
              </p>
            </div>
          </div>

          <div className="sk-stats-grid">
            <StatCard
              icon={<FaClipboardList />}
              title="New Orders"
              value="12"
              link="/shopkeeper/orders"
              variant="green"
              description="Orders awaiting attention"
            />

            <StatCard
              icon={<FaShoppingBag />}
              title="Total Products"
              value={productCount}
              link="/shopkeeper/inventory"
              variant="emerald"
              description="Products in your inventory"
            />

            <StatCard
              icon={<FaBoxes />}
              title="Low Stock"
              value="8"
              link="/shopkeeper/stocks"
              variant="orange"
              danger
              description="Products running low"
            />

            <StatCard
              icon={<FaRupeeSign />}
              title="Today's Revenue"
              value="₹4,520"
              variant="green"
              description="Revenue generated today"
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="sk-quick-actions">
          <div className="sk-section-heading">
            <div>
              <h3>Quick Actions</h3>

              <p>
                Manage your shop with a single click.
              </p>
            </div>
          </div>

          <div className="sk-actions-grid">
            <QuickAction
              icon={<FaClipboardList />}
              title="Manage Orders"
              description="View and manage customer orders"
              link="/shopkeeper/orders"
            />

            <QuickAction
              icon={<FaPlus />}
              title="Add Products"
              description="Add new products to your shop"
              link="/shopkeeper/add-products"
            />

            <QuickAction
              icon={<FaBoxes />}
              title="Inventory"
              description="Manage stock and product pricing"
              link="/shopkeeper/inventory"
            />

            <QuickAction
              icon={<FaStore />}
              title="Shop Profile"
              description="Update your shop information"
              link="/shopkeeper/profile"
            />
          </div>
        </section>
      </main>
    </>
  );
}

/* =========================================
   Statistic Card
========================================= */

function StatCard({
  icon,
  title,
  value,
  link,
  variant = "green",
  danger = false,
  description
}) {
  const Wrapper = link ? Link : "div";

  return (
    <Wrapper
      to={link}
      className={`sk-stat-card ${variant} ${
        danger ? "danger" : ""
      }`}
    >
      <div className="sk-stat-card-top">
        <div className="sk-stat-icon">
          {icon}
        </div>

        {link && (
          <div className="sk-stat-arrow">
            <FaArrowRight />
          </div>
        )}
      </div>

      <div className="sk-stat-info">
        <p>{title}</p>

        <h3>{value}</h3>

        <span>{description}</span>
      </div>
    </Wrapper>
  );
}

/* =========================================
   Quick Action Card
========================================= */

function QuickAction({
  icon,
  title,
  description,
  link
}) {
  return (
    <Link
      to={link}
      className="sk-action-card"
    >
      <div className="sk-action-icon">
        {icon}
      </div>

      <div className="sk-action-content">
        <h4>{title}</h4>

        <p>{description}</p>
      </div>

      <div className="sk-action-arrow">
        <FaArrowRight />
      </div>
    </Link>
  );
}
