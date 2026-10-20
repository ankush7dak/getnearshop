
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaTruck,
  FaBoxOpen,
  FaSyncAlt,
} from "react-icons/fa";

import "./ShopkeeperOrders.css";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import { LINKS } from "../../../constants/LinksUtility";

const API = `${LINKS.API_BASE_URL}/api/shop/orders`;

const STATUS_TABS = [
  "ALL",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS = {
  PLACED: "New",
  CONFIRMED: "Accepted",
  PROCESSING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ShopkeeperOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOrders = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await axios.get(API, {
        withCredentials: true,
      });

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load orders. Please check your login and backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const performAction = async (order, action, status = null) => {
    const orderId = order.orderId;

    setActionLoading(`${orderId}-${action}`);
    setError("");
    setSuccess("");

    try {
      if (action === "accept") {
        await axios.patch(
          `${API}/${orderId}/accept`,
          {},
          { withCredentials: true }
        );
      } else if (action === "reject") {
        await axios.patch(
          `${API}/${orderId}/reject`,
          {},
          { withCredentials: true }
        );
      } else if (action === "status") {
        await axios.patch(
          `${API}/${orderId}/status`,
          { status },
          { withCredentials: true }
        );
      }

      setSuccess(
        `Order #${orderId} updated successfully.`
      );

      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus:
            action === "accept"
              ? "CONFIRMED"
              : action === "reject"
                ? "CANCELLED"
                : status,
        }));
      }

      await fetchOrders(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to update order #${orderId}. Please try again.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || "";

    const matchesStatus =
      activeTab === "ALL" || status === activeTab;

    const customer = String(order.customerName ?? order.userId ?? "");
    const orderId = String(order.orderId ?? "");

    const matchesSearch =
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const renderActions = (order) => {
    const status = order.orderStatus;
    const busy = actionLoading?.startsWith(`${order.orderId}-`);

    return (
      <div className="order-actions">
        <button
          className="order-btn view"
          onClick={() => setSelectedOrder(order)}
          disabled={busy}
        >
          <FaEye /> View
        </button>

        {status === "PLACED" && (
          <>
            <button
              className="order-btn accept"
              onClick={() => performAction(order, "accept")}
              disabled={busy}
            >
              <FaCheck />
              {actionLoading === `${order.orderId}-accept`
                ? "Accepting..."
                : "Accept"}
            </button>

            <button
              className="order-btn reject"
              onClick={() => performAction(order, "reject")}
              disabled={busy}
            >
              <FaTimes />
              {actionLoading === `${order.orderId}-reject`
                ? "Rejecting..."
                : "Reject"}
            </button>
          </>
        )}

        {status === "CONFIRMED" && (
          <button
            className="order-btn prepare"
            onClick={() =>
              performAction(order, "status", "PROCESSING")
            }
            disabled={busy}
          >
            <FaBoxOpen /> Start preparing
          </button>
        )}

        {status === "PROCESSING" && (
          <>
            <button
              className="order-btn delivery"
              onClick={() =>
                performAction(order, "status", "OUT_FOR_DELIVERY")
              }
              disabled={busy}
            >
              <FaTruck /> Out for delivery
            </button>

            <button
              className="order-btn complete"
              onClick={() =>
                performAction(order, "status", "DELIVERED")
              }
              disabled={busy}
            >
              <FaCheck /> Mark delivered
            </button>
          </>
        )}

        {status === "OUT_FOR_DELIVERY" && (
          <button
            className="order-btn complete"
            onClick={() =>
              performAction(order, "status", "DELIVERED")
            }
            disabled={busy}
          >
            <FaBoxOpen /> Complete delivery
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <ShopkeeperTopNav />

      <main className="orders-page">
        <div className="orders-heading">
          <div>
            <h2>Orders Management</h2>
            <p>Manage customer orders from your shop.</p>
          </div>

          <button
            className="refresh-orders"
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="orders-alert error-alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="orders-alert success-alert">
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <section className="orders-toolbar">
          <div className="orders-search">
            <FaSearch />
            <input
              type="search"
              placeholder="Search by order ID or customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="status-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "ALL"
                  ? "All"
                  : STATUS_LABELS[tab] || tab.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </section>

        {!loading && (
          <div className="orders-summary">
            <span>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </span>
          </div>
        )}

        {loading ? (
          <div className="orders-state">
            <div className="orders-spinner" />
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-state empty-orders">
            <FaBoxOpen />
            <h3>No orders found</h3>
            <p>
              {orders.length === 0
                ? "New customer orders will appear here."
                : "Try changing the status filter or search term."}
            </p>
          </div>
        ) : (
          <section className="orders-grid">
            {filteredOrders.map((order) => {
              const status = order.orderStatus || "PLACED";
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <article className="order-card" key={order.orderId}>
                  <div className="order-card-head">
                    <div>
                      <span className="order-id-label">Order ID</span>
                      <h3>#{order.orderId}</h3>
                    </div>

                    <span className={`order-status status-${status.toLowerCase()}`}>
                      {STATUS_LABELS[status] || status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="order-card-details">
                    <p>
                      <span>Customer</span>
                      <strong>
                        {order.customerName || `Customer #${order.userId ?? "—"}`}
                      </strong>
                    </p>

                    <p>
                      <span>Items</span>
                      <strong>{order.totalItems ?? items.length}</strong>
                    </p>

                    <p>
                      <span>Total amount</span>
                      <strong className="order-amount">
                        ₹{Number(order.totalAmount ?? 0).toLocaleString("en-IN")}
                      </strong>
                    </p>

                    <p>
                      <span>Ordered on</span>
                      <strong>{formatDate(order.orderDate)}</strong>
                    </p>
                  </div>

                  <div className="order-item-preview">
                    <span>Products</span>
                    <p>
                      {items.length
                        ? items
                            .map(
                              (item) =>
                                `${item.productName || "Product"} × ${item.quantity ?? 1}`
                            )
                            .join(", ")
                        : "No item details available"}
                    </p>
                  </div>

                  {renderActions(order)}
                </article>
              );
            })}
          </section>
        )}

        {selectedOrder && (
          <div
            className="order-modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <section
              className="order-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="order-modal-header">
                <div>
                  <span>Order details</span>
                  <h3 id="order-modal-title">
                    Order #{selectedOrder.orderId}
                  </h3>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close order details"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-status-row">
                <span>Status</span>
                <span
                  className={`order-status status-${(
                    selectedOrder.orderStatus || "PLACED"
                  ).toLowerCase()}`}
                >
                  {STATUS_LABELS[selectedOrder.orderStatus] ||
                    selectedOrder.orderStatus}
                </span>
              </div>

              <div className="modal-info-grid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedOrder.customerName ||
                      `Customer #${selectedOrder.userId ?? "—"}`}
                  </strong>
                </div>

                <div>
                  <span>Shop ID</span>
                  <strong>{selectedOrder.shopId ?? "—"}</strong>
                </div>

                <div>
                  <span>Order date</span>
                  <strong>{formatDate(selectedOrder.orderDate)}</strong>
                </div>

                <div>
                  <span>Total items</span>
                  <strong>{selectedOrder.totalItems ?? 0}</strong>
                </div>
              </div>

              <h4 className="modal-section-title">Ordered products</h4>

              <div className="modal-items">
                {(selectedOrder.items || []).map((item) => (
                  <div className="modal-item" key={item.orderItemId ?? item.productId}>
                    <div>
                      <strong>{item.productName || "Product"}</strong>
                      <span>
                        ₹{Number(item.price ?? 0).toLocaleString("en-IN")} ×{" "}
                        {item.quantity ?? 0}
                      </span>
                    </div>

                    <strong>
                      ₹{Number(item.itemTotal ?? 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}

                {!(selectedOrder.items || []).length && (
                  <p className="modal-empty">No product details available.</p>
                )}
              </div>

              <div className="modal-bill">
                <p>
                  <span>Subtotal</span>
                  <strong>₹{selectedOrder.subtotal ?? 0}</strong>
                </p>
                <p>
                  <span>Discount</span>
                  <strong>
                    -₹{selectedOrder.discountAmount ?? 0}
                  </strong>
                </p>
                <p>
                  <span>Delivery fee</span>
                  <strong>₹{selectedOrder.deliveryFee ?? 0}</strong>
                </p>
                <p className="modal-total">
                  <span>Total amount</span>
                  <strong>
                    ₹{Number(selectedOrder.totalAmount ?? 0).toLocaleString("en-IN")}
                  </strong>
                </p>
              </div>

              {renderActions(selectedOrder)}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
