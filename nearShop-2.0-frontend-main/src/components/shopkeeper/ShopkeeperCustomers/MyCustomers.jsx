
import { useCallback, useEffect, useMemo, useState } from "react";
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
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";

const API = `${LINKS.API_BASE_URL}`;

export default function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/api/shop/customers`, {
        withCredentials: true,
      });

      setCustomers(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setError(
        err.response?.data?.message ||
          "Could not load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.customerName,
        customer.customerId,
        customer.mobile,
        customer.phone,
        customer.email,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [customers, searchText]);

  const openAddModal = () => {
    setCustomerId("");
    setFoundCustomer(null);
    setError("");
    setSuccess("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (adding || searching) return;

    setShowAddModal(false);
    setFoundCustomer(null);
    setCustomerId("");
  };

  const searchCustomer = async (event) => {
    event.preventDefault();

    const id = customerId.trim();

    if (!id) {
      setError("Please enter a customer ID.");
      return;
    }

    setSearching(true);
    setError("");
    setSuccess("");
    setFoundCustomer(null);

    try {
      const response = await axios.get(
        `${API}/api/shop/searchCustomer`,
        {
          params: { customerId: id },
          withCredentials: true,
        }
      );

      setFoundCustomer(response.data);
    } catch (err) {
      console.error("Customer search failed:", err);

      setError(
        err.response?.status === 404
          ? "No customer found with this ID."
          : err.response?.data?.message ||
              "Unable to search for this customer."
      );
    } finally {
      setSearching(false);
    }
  };

  const addCustomer = async () => {
    if (!foundCustomer?.customerId) {
      setError("Search for a valid customer first.");
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${API}/api/shop/addNewCustomer`,null,
        
        { params : { customerId: foundCustomer.customerId },
        withCredentials: true }
      );

      setSuccess("Customer added to your shop successfully.");

      await fetchCustomers();

      setTimeout(() => {
        setShowAddModal(false);
        setFoundCustomer(null);
        setCustomerId("");
        setSuccess("");
      }, 900);
    } catch (err) {
      console.error("Failed to add customer:", err);

      setError(
        err.response?.status === 409
          ? "This customer is already linked to your shop."
          : err.response?.data?.message ||
              "Could not add customer. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const isAlreadyAdded = foundCustomer
    ? customers.some(
        (customer) =>
          String(customer.customerId) ===
          String(foundCustomer.customerId)
      )
    : false;

  const getInitials = (customer) => {
    const name =
      customer.name || customer.customerName || "Customer";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    
    <><ShopkeeperTopNav></ShopkeeperTopNav>
    <div className="my-customers-page">
        
      <div className="mc-page-header">
        <div>
          <div className="mc-eyebrow">SHOP MANAGEMENT</div>
          <h1>My Customers</h1>
          <p>Manage customers connected to your shop.</p>
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

      <div className="mc-search-box">
        <FaSearch />
        <input
          type="search"
          placeholder="Search by name, customer ID, mobile or email..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
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

      {error && !showAddModal && (
        <div className="mc-alert mc-alert-error">{error}</div>
      )}

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
            {searchText ? "No matching customers" : "No customers yet"}
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
              <div className="mc-customer-top">
                <div className="mc-avatar">
                  {getInitials(customer)}
                </div>

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

                <span className="mc-linked-badge">Linked</span>
              </div>

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
                    {customer.email || "Email not provided"}
                  </span>
                </div>

                <div>
                  <FaCalendarAlt />
                  <span>
                    {customer.createdAt || customer.linkedAt
                      ? `Linked ${new Date(
                          customer.linkedAt ||
                            customer.createdAt
                        ).toLocaleDateString()}`
                      : "Customer linked"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
            <div className="mc-modal-header">
              <div>
                <h2 id="mc-modal-title">Add Customer</h2>
                <p>Find an existing NearShop customer by ID.</p>
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
                    setError("");
                    setFoundCustomer(null);
                  }}
                  required
                />

                <button type="submit" disabled={searching}>
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mc-alert mc-alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="mc-alert mc-alert-success">
                {success}
              </div>
            )}

            {foundCustomer && (
              <div className="mc-found-customer">
                <div className="mc-customer-top">
                  <div className="mc-avatar">
                    {getInitials(foundCustomer)}
                  </div>

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
                      {foundCustomer.email || "Email not provided"}
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
                    disabled={adding}
                  >
                    <FaUserPlus />
                    {adding ? "Adding..." : "Add to My Shop"}
                  </button>
                )}
              </div>
            )}

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
    </div></>
  );
}
