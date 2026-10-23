
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import "./ShopkeeperInventory.css";

import {
  FaSearch,
  FaDownload,
  FaTrash,
  FaEyeSlash,
  FaEye,
  FaBoxes,
  FaEdit,
  FaTimes,
  FaSave,
  FaImage,
  FaCheck,
  FaExclamationTriangle,
  FaPlus,
  FaBoxOpen
} from "react-icons/fa";

import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";

export default function ShopkeeperInventoryPro() {
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sort, setSort] = useState("added");

  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [hasMore, setHasMore] = useState(true);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [subCategories, setSubcategories] = useState([]);

  const containerRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);

  // ---------------------------------------
  // Fetch inventory
  // ---------------------------------------

  const fetchAllInventoryData = useCallback(async (pageNumber = 0) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getAllInvertoryData`,
        {
          withCredentials: true,
          params: {
            page: pageNumber,
            size,
            search,
            category: category === "ALL" ? "" : category
          },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const newItems = res.data.productDTOList || [];
      const isLastPage = res.data.isLastPage;

      setFiltered((prev) =>
        pageNumber === 0 ? newItems : [...prev, ...newItems]
      );

      hasMoreRef.current = !isLastPage;
      setHasMore(!isLastPage);

      pageRef.current = pageNumber;
      setPage(pageNumber);
    } catch (error) {
      console.error("Inventory fetch failed:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [search, category, size]);

  // Reset inventory when search or category changes
  useEffect(() => {
    setFiltered([]);
    setSelected([]);

    pageRef.current = 0;
    hasMoreRef.current = true;

    setPage(0);
    setHasMore(true);

    fetchAllInventoryData(0);
  }, [search, category, fetchAllInventoryData]);

  // ---------------------------------------
  // Infinite scrolling
  // ---------------------------------------

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleScroll = () => {
      const isBottom =
        div.scrollTop + div.clientHeight >= div.scrollHeight - 80;

      if (
        isBottom &&
        hasMoreRef.current &&
        !loadingRef.current
      ) {
        const nextPage = pageRef.current + 1;
        fetchAllInventoryData(nextPage);
      }
    };

    div.addEventListener("scroll", handleScroll);

    return () => {
      div.removeEventListener("scroll", handleScroll);
    };
  }, [fetchAllInventoryData]);

  // ---------------------------------------
  // Fetch shop subcategories
  // ---------------------------------------

  useEffect(() => {
    const fetchAllShopSubCategories = async () => {
      try {
        const res = await axios.get(
          `${LINKS.API_BASE_URL}/api/shop/getShopSubCategories`,
          {
            withCredentials: true
          }
        );

        setSubcategories(res.data || []);
      } catch (error) {
        console.error("Subcategory fetch failed:", error);
      }
    };

    fetchAllShopSubCategories();
  }, []);

  // ---------------------------------------
  // Category options
  // ---------------------------------------

  const categories = useMemo(() => {
    const names = [
      ...filtered.map((item) => item.subcategoryName),
      ...filtered.map((item) => item.shopSubcategoryName),
      ...subCategories
    ];

    return [...new Set(names.filter(Boolean))];
  }, [filtered, subCategories]);

  // ---------------------------------------
  // Client-side stock filtering and sorting
  // ---------------------------------------

  const displayedItems = useMemo(() => {
    let data = [...filtered];

    if (stockFilter === "LOW") {
      data = data.filter(
        (item) => Number(item.stock) > 0 && Number(item.stock) <= 5
      );
    }

    if (stockFilter === "OUT") {
      data = data.filter((item) => Number(item.stock) === 0);
    }

    if (sort === "price") {
      data.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === "stock") {
      data.sort((a, b) => Number(b.stock) - Number(a.stock));
    }

    if (sort === "added") {
      data.sort(
        (a, b) =>
          new Date(b.added || 0) - new Date(a.added || 0)
      );
    }

    return data;
  }, [filtered, stockFilter, sort]);

  // ---------------------------------------
  // Selection
  // ---------------------------------------

  const toggleSelect = (productId) => {
    setSelected((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    const visibleIds = displayedItems.map((item) => item.productId);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...visibleIds])
      ]);
    }
  };

  // ---------------------------------------
  // Availability toggle
  // ---------------------------------------

  const toggleActive = (productId) => {
    setFiltered((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              isAvailable: !item.isAvailable
            }
          : item
      )
    );

    setEditData((prev) =>
      prev.productId === productId
        ? {
            ...prev,
            isAvailable: !prev.isAvailable
          }
        : prev
    );
  };

  // ---------------------------------------
  // Bulk delete
  // ---------------------------------------

  const bulkDelete = () => {
    if (selected.length === 0) return;

    if (!window.confirm("Delete selected products?")) return;

    // Local removal only.
    // Connect your delete API here for permanent deletion.

    setFiltered((prev) =>
      prev.filter((item) => !selected.includes(item.productId))
    );

    setSelected([]);
  };

  // ---------------------------------------
  // Edit product
  // ---------------------------------------

  const handleEdit = (item) => {
    setEditId(item.productId);
    setEditData({
      ...item,
      previewUrl: ""
    });

    setImageFile(null);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setEditData((prev) => ({
      ...prev,
      previewUrl
    }));
  };

  // ---------------------------------------
  // Update product
  // ---------------------------------------

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        productId: editData.productId,
        name: editData.name,
        price: Number(editData.price),
        cost: Number(editData.cost),
        description: editData.description || "",
        stock: Number(editData.stock),
        weight: editData.weight,
        isAvailable: editData.isAvailable
      };

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (imageFile) {
        formData.append("productImage", imageFile);
      }

      const res = await axios.post(
        `${LINKS.API_BASE_URL}/api/shop/updateProduct`,
        formData,
        {
          withCredentials: true
        }
      );

      setFiltered((prev) =>
        prev.map((item) =>
          item.productId === editId
            ? {
                ...item,
                ...payload,
                imageLink:
                  res.data.imageLink || item.imageLink
              }
            : item
        )
      );

      setEditId(null);
      setEditData({});
      setImageFile(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Unable to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
    setImageFile(null);
  };

  // ---------------------------------------
  // Export inventory to CSV
  // ---------------------------------------

  const exportInventory = () => {
    if (displayedItems.length === 0) {
      alert("No products available to export.");
      return;
    }

    const headers = [
      "Product ID",
      "Product Name",
      "Category",
      "Selling Price",
      "Cost Price",
      "Stock",
      "Availability",
      "Description"
    ];

    const rows = displayedItems.map((item) => [
      item.productId,
      item.name,
      item.subcategoryName || item.shopSubcategoryName || "",
      item.price,
      item.cost,
      item.stock,
      item.isAvailable ? "Available" : "Unavailable",
      item.description || ""
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nearshop-inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ---------------------------------------
  // Product card
  // ---------------------------------------

  const renderProductCard = (item) => {
    const isEditing = editId === item.productId;

    const price = Number(
      isEditing ? editData.price : item.price
    ) || 0;

    const cost = Number(
      isEditing ? editData.cost : item.cost
    ) || 0;

    const stock = Number(
      isEditing ? editData.stock : item.stock
    ) || 0;

    const margin =
      price > 0
        ? (((price - cost) / price) * 100).toFixed(1)
        : "0.0";

    const isAvailable = isEditing
      ? editData.isAvailable
      : item.isAvailable;

    const stockStatus =
      stock === 0
        ? "out"
        : stock <= 5
          ? "low"
          : "good";

    const categoryName =
      item.subcategoryName ||
      item.shopSubcategoryName ||
      "Uncategorized";

    return (
      <article
        className={`product-card ${
          stock === 0 ? "product-card-out" : ""
        } ${isEditing ? "product-card-editing" : ""}`}
        key={item.productId}
      >
        {/* Card Header */}

        <div className="product-card-header">
          <label className="product-select">
            <input
              type="checkbox"
              checked={selected.includes(item.productId)}
              onChange={() => toggleSelect(item.productId)}
            />

            <span>Select</span>
          </label>

          <span className="product-id">
            ID: {item.productId}
          </span>
        </div>

        {/* Product Image */}

        <div className="product-card-image">
          <img
            src={
              isEditing
                ? editData.previewUrl || item.imageLink
                : item.imageLink
            }
            alt={item.name}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="image-fallback">
            <FaImage />
          </div>

          {isEditing && (
            <label className="image-upload-button">
              <FaImage />
              Change Image

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}

          {!isEditing && (
            <span
              className={`availability-badge ${
                isAvailable ? "available" : "unavailable"
              }`}
            >
              {isAvailable ? (
                <>
                  <FaCheck /> Available
                </>
              ) : (
                <>
                  <FaEyeSlash /> Unavailable
                </>
              )}
            </span>
          )}
        </div>

        {/* Product Details */}

        <div className="product-card-body">
          <div className="product-title-row">
            <div className="product-title">
              <FaBoxes className="product-title-icon" />

              {isEditing ? (
                <input
                  className="product-name-input"
                  value={editData.name || ""}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  placeholder="Product name"
                />
              ) : (
                <h3>{item.name}</h3>
              )}
            </div>
          </div>

          <span className="product-category">
            {categoryName}
          </span>

          {/* Pricing */}

          <div className="product-pricing">
            <div className="price-block">
              <span className="price-label">
                Selling Price
              </span>

              {isEditing ? (
                <div className="price-input-wrapper">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    value={editData.price ?? ""}
                    onChange={(event) =>
                      handleChange("price", event.target.value)
                    }
                  />
                </div>
              ) : (
                <strong className="selling-price">
                  ₹{price.toLocaleString("en-IN")}
                </strong>
              )}
            </div>

            <div className="price-block">
              <span className="price-label">
                Cost Price
              </span>

              {isEditing ? (
                <div className="price-input-wrapper">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    value={editData.cost ?? ""}
                    onChange={(event) =>
                      handleChange("cost", event.target.value)
                    }
                  />
                </div>
              ) : (
                <strong className="cost-price">
                  ₹{cost.toLocaleString("en-IN")}
                </strong>
              )}
            </div>
          </div>

          {/* Margin */}

          <div className="product-margin">
            <div>
              <span>Profit Margin</span>
              <strong>{margin}%</strong>
            </div>

            <div className="margin-progress">
              <span
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, Number(margin))
                  )}%`
                }}
              />
            </div>
          </div>

          {/* Stock */}

          <div className="product-stock-row">
            <div className="stock-info">
              <span className="stock-label">
                Available Stock
              </span>

              {isEditing ? (
                <input
                  className="stock-input"
                  type="number"
                  min="0"
                  value={editData.stock ?? ""}
                  onChange={(event) =>
                    handleChange("stock", event.target.value)
                  }
                />
              ) : (
                <strong>{stock} units</strong>
              )}
            </div>

            <span className={`stock-badge ${stockStatus}`}>
              {stockStatus === "out"
                ? "Out of Stock"
                : stockStatus === "low"
                  ? "Low Stock"
                  : "In Stock"}
            </span>
          </div>

          {/* Description */}

          <div className="product-description">
            <span>Description</span>

            {isEditing ? (
              <textarea
                value={editData.description || ""}
                onChange={(event) =>
                  handleChange(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Product description"
                rows={3}
              />
            ) : (
              <p>
                {item.description || "No description available."}
              </p>
            )}
          </div>

          {/* Availability */}

          <div className="product-availability-row">
            <div>
              <span className="availability-title">
                Product Visibility
              </span>

              <small>
                {isAvailable
                  ? "Visible to customers"
                  : "Hidden from customers"}
              </small>
            </div>

            <button
              type="button"
              className={`availability-toggle ${
                isAvailable ? "active" : ""
              }`}
              onClick={() => {
                if (isEditing) {
                  handleChange(
                    "isAvailable",
                    !editData.isAvailable
                  );
                } else {
                  toggleActive(item.productId);
                }
              }}
              aria-label="Toggle product availability"
            >
              <span />
            </button>
          </div>
        </div>

        {/* Actions */}

        <div className="product-card-footer">
          {isEditing ? (
            <>
              <button
                className="card-action-button save-button"
                onClick={handleUpdate}
                disabled={loading}
              >
                <FaSave />
                Save Changes
              </button>

              <button
                className="card-action-button cancel-button"
                onClick={cancelEdit}
              >
                <FaTimes />
                Cancel
              </button>
            </>
          ) : (
            <button
              className="card-action-button edit-button"
              onClick={() => handleEdit(item)}
            >
              <FaEdit />
              Edit Product
            </button>
          )}
        </div>
      </article>
    );
  };

  // ---------------------------------------
  // Main UI
  // ---------------------------------------

  return (
    <>
      <ShopkeeperTopNav />

      <main className="inventory-pro">
        {loading && <Loading />}

        {/* Header */}

        <header className="inventory-header">
          <div className="inventory-heading">
            <div className="inventory-heading-icon">
              <FaBoxes />
            </div>

            <div>
              <h2>Inventory Management</h2>

              <p>
                Manage your products, pricing, and stock
              </p>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="bulk-actions">
              <span>
                {selected.length} products selected
              </span>

              <button onClick={bulkDelete}>
                <FaTrash />
                Delete
              </button>
            </div>
          )}
        </header>

        {/* Toolbar */}

        <section className="inventory-toolbar">
          <div className="search">
            <FaSearch />

            <input
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="ALL">All Categories</option>

            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value)
            }
          >
            <option value="ALL">All Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
          </select>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="added">Newest</option>
            <option value="price">Highest Price</option>
            <option value="stock">Highest Stock</option>
          </select>

          <button
            className="export-button"
            onClick={exportInventory}
          >
            <FaDownload />
            Export
          </button>
        </section>

        {/* Inventory Summary */}

        <section className="inventory-summary">
          <div className="summary-item">
            <div className="summary-icon">
              <FaBoxes />
            </div>

            <div>
              <span>Total Products</span>
              <strong>{filtered.length}</strong>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon summary-icon-green">
              <FaCheck />
            </div>

            <div>
              <span>Available</span>

              <strong>
                {
                  filtered.filter(
                    (item) => item.isAvailable
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon summary-icon-orange">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>Low Stock</span>

              <strong>
                {
                  filtered.filter(
                    (item) =>
                      Number(item.stock) > 0 &&
                      Number(item.stock) <= 5
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon summary-icon-red">
              <FaBoxOpen />
            </div>

            <div>
              <span>Out of Stock</span>

              <strong>
                {
                  filtered.filter(
                    (item) => Number(item.stock) === 0
                  ).length
                }
              </strong>
            </div>
          </div>
        </section>

        {/* Select All */}

        <div className="inventory-list-heading">
          <div>
            <h3>Your Products</h3>

            <p>
              {displayedItems.length} products displayed
            </p>
          </div>

          <label className="select-all">
            <input
              type="checkbox"
              checked={
                displayedItems.length > 0 &&
                displayedItems.every((item) =>
                  selected.includes(item.productId)
                )
              }
              onChange={selectAll}
            />

            Select All
          </label>
        </div>

        {/* Product Cards */}

        <div
          className="product-card-container"
          ref={containerRef}
        >
          {displayedItems.length > 0 ? (
            <div className="product-grid">
              {displayedItems.map(renderProductCard)}
            </div>
          ) : (
            !loading && (
              <div className="inventory-empty">
                <div className="empty-icon">
                  <FaBoxOpen />
                </div>

                <h3>No products found</h3>

                <p>
                  Try changing your search or filter options.
                </p>
              </div>
            )
          )}

          {loading && (
            <div className="inventory-loading">
              Loading products...
            </div>
          )}

          {!hasMore && displayedItems.length > 0 && (
            <div className="inventory-end">
              You have reached the end of your inventory.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
