
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch customer's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:8081/api/customer/my-orders",
          {
            withCredentials: true,
          }
        );

        // API returns an array of orders
        const data = response.data;

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Failed to fetch orders:",
          err.response?.data || err.message
        );

        setError(
          err.response?.status === 401
            ? "Please log in to view your orders."
            : "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    // Filter by status
    if (activeTab === "Active") {
      data = data.filter((order) =>
        [
          "PLACED",
          "CONFIRMED",
          "PROCESSING",
          "OUT_FOR_DELIVERY",
        ].includes(order.orderStatus)
      );
    } else if (activeTab === "Delivered") {
      data = data.filter(
        (order) => order.orderStatus === "DELIVERED"
      );
    } else if (activeTab === "Cancelled") {
      data = data.filter(
        (order) => order.orderStatus === "CANCELLED"
      );
    }

    // Search by order ID, shop name, shop ID or product name
    const searchText = search.trim().toLowerCase();

    if (searchText) {
      data = data.filter((order) => {
        const orderIdMatch = String(order.orderId ?? "")
          .toLowerCase()
          .includes(searchText);

        const shopMatch = String(order.shopName ?? "")
          .toLowerCase()
          .includes(searchText);

        const shopIdMatch = String(order.shopId ?? "")
          .toLowerCase()
          .includes(searchText);

        const productMatch = (order.items ?? []).some((item) =>
          String(item.productName ?? "")
            .toLowerCase()
            .includes(searchText)
        );

        return (
          orderIdMatch ||
          shopMatch ||
          shopIdMatch ||
          productMatch
        );
      });
    }

    // Sort by order date
    data.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime() || 0;
      const dateB = new Date(b.orderDate).getTime() || 0;

      return sort === "oldest"
        ? dateA - dateB
        : dateB - dateA;
    });

    return data;
  }, [orders, activeTab, search, sort]);

  // Display-friendly status
  const getStatusText = (status) => {
    const statusLabels = {
      PLACED: "Placed",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };

    return statusLabels[status] || status || "Unknown";
  };

  const getStatusClass = (status) => {
    if (
      [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "OUT_FOR_DELIVERY",
      ].includes(status)
    ) {
      return "active";
    }

    if (status === "DELIVERED") return "delivered";
    if (status === "CANCELLED") return "cancelled";

    return "";
  };

  // Format money in Indian currency
  const formatPrice = (amount) => {
    const value = Number(amount ?? 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  };

  // Format API date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "OUT_FOR_DELIVERY",
  ];

  return (
    <div className="customer-orders-container">
      <div className="nearshop-orders-page">
        <h2 className="page-title">My Orders</h2>

        {/* FILTER BAR */}
        <div className="orders-toolbar">
          <div className="tabs">
            {["All", "Active", "Delivered", "Cancelled"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  className={
                    activeTab === tab ? "tab active" : "tab"
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search orders or products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              aria-label="Sort orders"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="empty-orders">
            <h3>Loading orders...</h3>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="empty-orders">
            <h3>{error}</h3>

            <button
              type="button"
              className="btn primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* ORDER LIST */}
        {!loading && !error && (
          <div className="orders-list">
            {filteredOrders.length === 0 && (
              <div className="empty-orders">
                <h3>
                  {orders.length === 0
                    ? "No orders yet"
                    : "No orders found"}
                </h3>

                <p>
                  {orders.length === 0
                    ? "Your orders will appear here after you place an order."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            )}

            {filteredOrders.map((order) => (
              <div className="order-card" key={order.orderId}>
                {/* ORDER HEADER */}
                <div className="order-top">
                  <div>
                    <h4>
                      {order.shopName || `Shop #${order.shopId}`}
                    </h4>

                    <p>Shop ID: {order.shopId}</p>
                    <p>Order ID: {order.orderId}</p>

                    <p className="order-date">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>

                {/* ORDER ITEMS */}
                <div className="order-middle">
                  {(order.items ?? []).map((item, index) => (
                    <div
                      className="order-item"
                      key={
                        item.orderItemId ??
                        `${item.productId}-${index}`
                      }
                    >
                      <div>
                        <strong>
                          {item.productName || "Product"}
                        </strong>

                        <span> × {item.quantity ?? 0}</span>

                        <p>
                          {formatPrice(item.price)} per item
                        </p>
                      </div>

                      <div>
                        {formatPrice(
                          item.itemTotal ??
                            Number(item.price ?? 0) *
                              Number(item.quantity ?? 0)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ORDER TOTALS */}
                <div className="order-bottom">
                  <div className="price">
                    <span>Total: </span>
                    {formatPrice(order.totalAmount)}
                  </div>

                  <div className="actions">
                    {activeStatuses.includes(order.orderStatus) && (
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                          alert(
                            `Order #${order.orderId}: ${getStatusText(
                              order.orderStatus
                            )}`
                          )
                        }
                      >
                        Track
                      </button>
                    )}

                    {order.orderStatus === "DELIVERED" && (
                      <>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() =>
                            alert("Invoice feature is not implemented yet.")
                          }
                        >
                          Invoice
                        </button>

                        <button
                          type="button"
                          className="btn primary"
                          onClick={() =>
                            alert("Reorder feature is not implemented yet.")
                          }
                        >
                          Reorder
                        </button>
                      </>
                    )}

                    {order.orderStatus === "CANCELLED" && (
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                          alert(
                            `Order #${order.orderId} was cancelled.`
                          )
                        }
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
