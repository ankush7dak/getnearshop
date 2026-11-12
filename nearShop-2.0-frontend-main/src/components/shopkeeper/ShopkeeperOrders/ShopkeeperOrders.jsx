
import { useCallback, useEffect, useRef, useState } from "react";
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
import { LINKS } from "../../../constants/LinksUtility";

const API = `${LINKS.API_BASE_URL}/api/shop/orders`;

const STATUS_TABS = [
  "ALL",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS = {
  PLACED: "New",
  CONFIRMED: "Accepted",
  PROCESSING: "Preparing",
  READY: "You can pickup now",
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

// Generate customer initials when profile image is unavailable
const getInitials = (name, userId) => {
  if (!name || !name.trim()) {
    return String(userId || "C").slice(0, 2).toUpperCase();
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

// Reusable customer avatar
function CustomerAvatar({
  imageUrl,
  name,
  userId,
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  const showImage =
    typeof imageUrl === "string" &&
    imageUrl.trim().length > 0 &&
    !imageError;

  return (
    <div className={`customer-avatar ${className}`}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={name || "Customer"}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name, userId)}</span>
      )}
    </div>
  );
}

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

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Fetch orders
  const fetchOrders = useCallback(
    async (pageNumber = 0, reset = false) => {
      if (pageNumber === 0) {
        if (reset) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        if (loadingMoreRef.current || !hasMore) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      setError("");

      try {
        const response = await axios.get(API, {
          withCredentials: true,
          params: {
            page: pageNumber,
            size: 8,
          },
        });

        const data = response.data;

        // Supports Spring Page response and plain array
        const newOrders = Array.isArray(data)
          ? data
          : data?.content || [];

        setOrders((prev) =>
          reset || pageNumber === 0
            ? newOrders
            : [...prev, ...newOrders]
        );

        setPage(pageNumber);

        setHasMore(
          Array.isArray(data)
            ? newOrders.length === 8
            : data?.last === false
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load orders. Please check your login and backend."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [hasMore]
  );

  useEffect(() => {
    fetchOrders(0, true);
  }, [fetchOrders]);

  // Infinite scrolling
  const lastOrderRef = useCallback(
    (node) => {
      if (loading) return;

      observerRef.current?.disconnect();

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !loadingMoreRef.current
          ) {
            fetchOrders(page + 1);
          }
        },
        {
          threshold: 0.1,
        }
      );

      observerRef.current.observe(node);
    },
    [loading, hasMore, page, fetchOrders]
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Accept / Reject / Update order status
  const performAction = async (order, action, status = null) => {
    const orderId = order.orderId;

    setActionLoading(`${orderId}-${action}`);
    setError("");
    setSuccess("");

    try {
      if (action === "accept") {
        await axios.post(
          `${LINKS.API_BASE_URL}/api/shop/${orderId}/accept`,
          {},
          { withCredentials: true }
        );
      } else if (action === "reject") {
        await axios.post(
          `${LINKS.API_BASE_URL}/api/shop/${orderId}/reject`,
          {},
          { withCredentials: true }
        );
      } else if (action === "status") {
        await axios.post(
          `${LINKS.API_BASE_URL}/api/shop/${orderId}/status`,
          {},
          {
            withCredentials: true,
            params: { status },
          }
        );
      }

      setSuccess(`Order #${orderId} updated successfully.`);

      const updatedStatus =
        action === "accept"
          ? "CONFIRMED"
          : action === "reject"
            ? "CANCELLED"
            : status;

      setOrders((prev) =>
        prev.map((item) =>
          item.orderId === orderId
            ? { ...item, orderStatus: updatedStatus }
            : item
        )
      );

      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: updatedStatus,
        }));
      }

      // Refresh first page after action
      await fetchOrders(0, true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to update order #${orderId}. Please try again.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Search and filter
  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || "";

    const matchesStatus =
      activeTab === "ALL" || status === activeTab;

    const customer = String(
      order.customerName ?? order.userId ?? ""
    );

    const orderId = String(order.orderId ?? "");

    const matchesSearch =
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Action buttons
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
                performAction(order, "status", "READY_FOR_PICKUP")
              }
              disabled={busy}
            >
              <FaTruck />Ready for pickup
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

        {status === "READY_FOR_PICKUP" && (
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
      <main className="orders-page">
        {/* Page heading */}
        <div className="orders-heading">
          <div>
            <h2>Orders Management</h2>
            <p>Manage customer orders from your shop.</p>
          </div>

          <button
            className="refresh-orders"
            onClick={() => fetchOrders(0, true)}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="orders-alert error-alert">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Success message */}
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

        {/* Search and filters */}
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

        {/* Orders count */}
        {!loading && (
          <div className="orders-summary">
            <span>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </span>
          </div>
        )}

        {/* Loading */}
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
          /* Order cards */
          <section className="orders-grid">
            {filteredOrders.map((order, index) => {
              const status = order.orderStatus || "PLACED";
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              return (
                <article
                  className="order-card"
                  key={order.orderId}
                  ref={
                    index === filteredOrders.length - 6
                      ? lastOrderRef
                      : null
                  }
                >
                  {/* Card header */}
                  <div className="order-card-head">
                    <div>
                      <span className="order-id-label">
                        Order ID
                      </span>
                      <h3>#{order.orderId}</h3>
                    </div>

                    <span
                      className={`order-status status-${status.toLowerCase()}`}
                    >
                      {STATUS_LABELS[status] ||
                        status.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Customer and order details */}
                  <div className="order-card-details">

                    {/* Customer with profile image */}
                    <div className="order-customer-info">
                      <CustomerAvatar
                        imageUrl={order.profileImageUrl}
                        name={order.customerName}
                        userId={order.userId}
                      />

                      <div className="order-customer-text">
                        <span>Customer Name</span>
                        <strong>
                          {order.customerName ||
                            `Name not found`}
                        </strong>
                        <span>Mobile</span>
                        <strong>
                          {order.mobileNo ||
                            `Mobile not available`}
                        </strong>
                        <span>Customer Id</span>
                        <strong>
                          {
                            `#${order.userId ?? "—"}`}
                         </strong>
                        {/*<strong>Customer Name</strong>
                        <span>
                          {order.customerName ||
                            `Name not Provided`}
                        </span>
                        <strong>Mobile</strong>
                        <span>
                          {order.mobileNo ||
                            `Mobile not available`}
                        </span>
                        <strong>Customer Id</strong>
                        <span>
                          {
                            `#${order.userId ?? "—"}`}
                        </span> */}
                      </div>
                    </div>

                    <p>
                      <span>Items</span>
                      <strong>
                        {order.totalItems ?? items.length}
                      </strong>
                    </p>

                    <p>
                      <span>Total amount</span>
                      <strong className="order-amount">
                        ₹
                        {Number(
                          order.totalAmount ?? 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </p>

                    <p>
                      <span>Ordered on</span>
                      <strong>{formatDate(order.orderDate)}</strong>
                    </p>
                  </div>

                  {/* Products preview */}
                  <div className="order-item-preview">
                    <span>Products</span>
                    <p>
                      {items.length
                        ? items
                            .map(
                              (item) =>
                                `${item.productName || "Product"} × ${
                                  item.quantity ?? 1
                                }`
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

        {/* Pagination loader */}
        {loadingMore && (
          <div className="orders-state">
            <div className="orders-spinner" />
            <p>Loading more orders...</p>
          </div>
        )}

        {/* Order details modal */}
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
              {/* Modal header */}
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

              {/* Status */}
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

              {/* Customer and order information */}
              <div className="modal-info-grid">

                {/* Customer with profile image */}
                <div className="modal-customer-info">
                  <CustomerAvatar
                    imageUrl={selectedOrder.profileImageUrl}
                    name={selectedOrder.customerName}
                    userId={selectedOrder.userId}
                    className="modal-customer-avatar"
                  />

                  <div>
                    <span>Customer</span>
                    <strong>
                      {selectedOrder.customerName ||
                        `Customer #${selectedOrder.userId ?? "—"}`}
                    </strong>
                  </div>
                </div>

                <div>
                  <span>Shop ID</span>
                  <strong>{selectedOrder.shopId ?? "—"}</strong>
                </div>

                <div>
                  <span>Order date</span>
                  <strong>
                    {formatDate(selectedOrder.orderDate)}
                  </strong>
                </div>

                <div>
                  <span>Total items</span>
                  <strong>
                    {selectedOrder.totalItems ?? 0}
                  </strong>
                </div>
              </div>

              {/* Products */}
              <h4 className="modal-section-title">
                Ordered products
              </h4>

              <div className="modal-items">
                {(selectedOrder.items || []).map((item) => (
                  <div
                    className="modal-item"
                    key={item.orderItemId ?? item.productId}
                  >
                    <div>
                      <strong>
                        {item.productName || "Product"}
                      </strong>

                      <span>
                        ₹
                        {Number(item.price ?? 0).toLocaleString("en-IN")}
                        {" "}×{" "}
                        {item.quantity ?? 0}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(item.itemTotal ?? 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}

                {!(selectedOrder.items || []).length && (
                  <p className="modal-empty">
                    No product details available.
                  </p>
                )}
              </div>

              {/* Bill details */}
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
                  <strong>
                    ₹{selectedOrder.deliveryFee ?? 0}
                  </strong>
                </p>

                <p className="modal-total">
                  <span>Total amount</span>
                  <strong>
                    ₹
                    {Number(
                      selectedOrder.totalAmount ?? 0
                    ).toLocaleString("en-IN")}
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
