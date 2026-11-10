
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaSearch,
  FaUserPlus,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaSyncAlt,
  FaTimes,
  FaIdCard,
} from "react-icons/fa";

import { LINKS } from "../../../constants/LinksUtility";
import "./MyCustomers.css";

const API = LINKS.API_BASE_URL;

// ========================================
// CUSTOMER AVATAR
// Shows image when available, otherwise initials
// ========================================

function CustomerAvatar({ customer }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    typeof customer?.profileImageUrl === "string"
      ? customer.profileImageUrl.trim()
      : "";

  const name =
    customer?.name ||
    customer?.customerName ||
    "Customer";

  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="mc-avatar">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials || "C"}</span>
      )}
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState("");

  const closeTimer = useRef(null);

  // ========================================
  // FETCH CUSTOMERS
  // ========================================

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await axios.get(
        `${API}/api/shop/customers`,
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.content)) {
        setCustomers(data.content);
      } else if (Array.isArray(data?.customers)) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setPageError(
        err.response?.data?.message ||
          "Could not load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, [fetchCustomers]);

  // ========================================
  // SEARCH / FILTER CUSTOMERS
  // ========================================

  const filteredCustomers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const fields = [
        customer.name,
        customer.customerName,
        customer.customerId,
        customer.mobile,
        customer.phone,
        customer.email,
      ];

      return fields.some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [customers, searchText]);

  // ========================================
  // DATE FORMATTER
  // ========================================

  const formatLinkedDate = (customer) => {
    const dateValue =
      customer?.linkedAt || customer?.createdAt;

    if (!dateValue) return "Customer linked";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Customer linked";
    }

    return `Linked ${date.toLocaleDateString()}`;
  };

  // ========================================
  // OPEN ADD CUSTOMER MODAL
  // ========================================

  const openAddModal = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setCustomerId("");
    setFoundCustomer(null);
    setModalError("");
    setSuccess("");
    setShowAddModal(true);
  };

  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeAddModal = () => {
    if (adding || searching) return;

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setShowAddModal(false);
    setFoundCustomer(null);
    setCustomerId("");
    setModalError("");
    setSuccess("");
  };

  // ========================================
  // SEARCH CUSTOMER BY ID
  // ========================================

  const searchCustomer = async (event) => {
    event.preventDefault();

    const id = customerId.trim();

    if (!id) {
      setModalError("Please enter a customer ID.");
      return;
    }

    setSearching(true);
    setModalError("");
    setSuccess("");
    setFoundCustomer(null);

    try {
      const response = await axios.get(
        `${API}/api/shop/searchCustomer`,
        {
          params: {
            customerId: id,
          },
          withCredentials: true,
        }
      );

      if (!response.data?.customerId) {
        setModalError(
          "Invalid customer information received."
        );
        return;
      }

      setFoundCustomer(response.data);
    } catch (err) {
      console.error("Customer search failed:", err);

      setModalError(
        err.response?.status === 404
          ? "No customer found with this ID."
          : err.response?.data?.message ||
              "Unable to search for this customer."
      );
    } finally {
      setSearching(false);
    }
  };

  // ========================================
  // CHECK DUPLICATE CUSTOMER
  // ========================================

  const isAlreadyAdded = foundCustomer
    ? customers.some(
        (customer) =>
          String(customer.customerId) ===
          String(foundCustomer.customerId)
      )
    : false;

  // ========================================
  // ADD CUSTOMER TO SHOP
  // ========================================

  const addCustomer = async () => {
    if (!foundCustomer?.customerId) {
      setModalError("Search for a valid customer first.");
      return;
    }

    if (isAlreadyAdded) {
      setModalError(
        "This customer is already linked to your shop."
      );
      return;
    }

    setAdding(true);
    setModalError("");
    setSuccess("");

    try {
      await axios.post(
        `${API}/api/shop/addNewCustomer`,
        null,
        {
          params: {
            customerId: foundCustomer.customerId,
          },
          withCredentials: true,
        }
      );

      setSuccess(
        "Customer added to your shop successfully."
      );

      // Update customer directory
      await fetchCustomers();

      // Close modal after successful addition
      closeTimer.current = setTimeout(() => {
        setShowAddModal(false);
        setFoundCustomer(null);
        setCustomerId("");
        setSuccess("");
        closeTimer.current = null;
      }, 1000);
    } catch (err) {
      console.error("Failed to add customer:", err);

      setModalError(
        err.response?.status === 409
          ? "This customer is already linked to your shop."
          : err.response?.data?.message ||
              "Could not add customer. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="my-customers-page">

      {/* PAGE HEADER */}

      <div className="mc-page-header">
        <div>
          <div className="mc-eyebrow">
            SHOP MANAGEMENT
          </div>

          <h1>My Customers</h1>

          <p>
            Manage customers connected to your shop.
          </p>
        </div>

        <button
          className="mc-add-button"
          type="button"
          onClick={openAddModal}
        >
          <FaUserPlus />
          <span>Add Customer</span>
        </button>
      </div>

      {/* SUMMARY CARD */}

      <div className="mc-summary-card">
        <div className="mc-summary-icon">
          <FaUsers />
        </div>

        <div>
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
          <small>Linked to your shop</small>
        </div>
      </div>

      {/* DIRECTORY HEADER */}

      <div className="mc-list-header">
        <div>
          <h2>Customer Directory</h2>

          <p>
            {filteredCustomers.length} customer
            {filteredCustomers.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        <button
          type="button"
          className="mc-refresh-button"
          onClick={fetchCustomers}
          disabled={loading}
          aria-label="Refresh customers"
          title="Refresh customers"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      {/* SEARCH BOX */}

      <div className="mc-search-box">
        <FaSearch />

        <input
          type="search"
          placeholder="Search by name, customer ID, mobile or email..."
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
        />

        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText("")}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* PAGE ERROR */}

      {pageError && (
        <div className="mc-alert mc-alert-error">
          {pageError}
        </div>
      )}

      {/* CUSTOMER DIRECTORY */}

      {loading ? (
        <div className="mc-state">
          <div className="mc-spinner" />
          <p>Loading your customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="mc-empty-state">
          <div className="mc-empty-icon">
            <FaUsers />
          </div>

          <h3>
            {searchText
              ? "No matching customers"
              : "No customers yet"}
          </h3>

          <p>
            {searchText
              ? "Try a different name, ID, mobile number or email."
              : "Add an existing NearShop customer using their customer ID."}
          </p>

          {!searchText && (
            <button
              type="button"
              className="mc-add-button"
              onClick={openAddModal}
            >
              <FaUserPlus />
              Add Your First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="mc-customer-grid">
          {filteredCustomers.map((customer) => (
            <article
              className="mc-customer-card"
              key={customer.customerId}
            >

              {/* CUSTOMER HEADER */}

              <div className="mc-customer-top">

                <CustomerAvatar customer={customer} />

                <div className="mc-customer-heading">
                  <h3>
                    {customer.name ||
                      customer.customerName ||
                      "Unnamed Customer"}
                  </h3>

                  <span className="mc-customer-id">
                    ID: {customer.customerId}
                  </span>
                </div>

                <span className="mc-linked-badge">
                  Linked
                </span>
              </div>

              {/* CUSTOMER DETAILS */}

              <div className="mc-customer-details">
                <div>
                  <FaPhone />

                  <span>
                    {customer.mobile ||
                      customer.phone ||
                      "Mobile not provided"}
                  </span>
                </div>

                <div>
                  <FaEnvelope />

                  <span className="mc-detail-text">
                    {customer.email ||
                      "Email not provided"}
                  </span>
                </div>

                <div>
                  <FaCalendarAlt />

                  <span>
                    {formatLinkedDate(customer)}
                  </span>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}

      {showAddModal && (
        <div
          className="mc-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
        >
          <section
            className="mc-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mc-modal-title"
          >

            {/* MODAL HEADER */}

            <div className="mc-modal-header">
              <div>
                <h2 id="mc-modal-title">
                  Add Customer
                </h2>

                <p>
                  Find an existing NearShop customer by ID.
                </p>
              </div>

              <button
                type="button"
                className="mc-modal-close"
                onClick={closeAddModal}
                disabled={adding || searching}
                aria-label="Close dialog"
              >
                <FaTimes />
              </button>
            </div>

            {/* SEARCH FORM */}

            <form onSubmit={searchCustomer}>
              <label htmlFor="mc-customer-id">
                Customer ID
              </label>

              <div className="mc-id-search">
                <FaIdCard />

                <input
                  id="mc-customer-id"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter customer ID"
                  value={customerId}
                  onChange={(event) => {
                    setCustomerId(event.target.value);
                    setModalError("");
                    setSuccess("");
                    setFoundCustomer(null);
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={searching || adding}
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {/* MODAL ERROR */}

            {modalError && (
              <div className="mc-alert mc-alert-error">
                {modalError}
              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="mc-alert mc-alert-success">
                {success}
              </div>
            )}

            {/* FOUND CUSTOMER */}

            {foundCustomer && (
              <div className="mc-found-customer">

                <div className="mc-customer-top">
                  <CustomerAvatar customer={foundCustomer} />

                  <div className="mc-customer-heading">
                    <h3>
                      {foundCustomer.name ||
                        foundCustomer.customerName ||
                        "Unnamed Customer"}
                    </h3>

                    <span className="mc-customer-id">
                      ID: {foundCustomer.customerId}
                    </span>
                  </div>
                </div>

                <div className="mc-customer-details">
                  <div>
                    <FaPhone />

                    <span>
                      {foundCustomer.mobile ||
                        foundCustomer.phone ||
                        "Mobile not provided"}
                    </span>
                  </div>

                  <div>
                    <FaEnvelope />

                    <span className="mc-detail-text">
                      {foundCustomer.email ||
                        "Email not provided"}
                    </span>
                  </div>
                </div>

                {isAlreadyAdded ? (
                  <div className="mc-alert mc-alert-success">
                    This customer is already linked to your shop.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mc-add-button mc-confirm-add"
                    onClick={addCustomer}
                    disabled={adding || searching}
                  >
                    <FaUserPlus />
                    {adding
                      ? "Adding..."
                      : "Add to My Shop"}
                  </button>
                )}
              </div>
            )}

            {/* MODAL FOOTER */}

            <div className="mc-modal-footer">
              <button
                type="button"
                className="mc-cancel-button"
                onClick={closeAddModal}
                disabled={adding || searching}
              >
                Close
              </button>
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
