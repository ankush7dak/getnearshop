
import { useEffect, useState, useCallback } from "react";
import { FaStar, FaStore, FaSearch, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import "./NearShopSearchPage.css";
import { useCustomer } from "../CustomerContext/CustomerContext";
import { useNavigate } from "react-router-dom";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";

const STORAGE_KEY = "nearShopSearchPageState";

const shopDistances = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 200, 400, 500,
];

const loadSavedState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null || lon1 == null ||
    lat2 == null || lon2 == null
  ) {
    return null;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Number(
    (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
  );
}

export default function NearShopSearchPage() {
  const [savedState] = useState(loadSavedState);

  const [categories, setCategories] = useState(
    savedState.categories || []
  );
  const [userLocation, setUserLocation] = useState(
    savedState.userLocation || null
  );

  const [shopView,setShopView] = useState(false);
  const [shops, setShops] = useState(savedState.shops || []);
  const [shopId, setShopId] = useState(savedState.shopId || null);
  const [selectedShopName, setSelectedShopName] = useState(
    savedState.selectedShopName || "Choose a shop"
  );
  const [selectedShopSubCategories, setSelectedShopSubCategories] =
    useState(savedState.selectedShopSubCategories || []);

  const [shopSearch, setShopSearch] = useState(
    savedState.shopSearch || ""
  );
  const [shopCategory, setShopCategory] = useState(
    savedState.shopCategory || "All"
  );
  const [shopDistanceRange, setShopDistanceRange] = useState(
    savedState.shopDistanceRange || 500
  );
  const [shopPage, setShopPage] = useState(
    savedState.shopPage || 0
  );
  const [shopSearchSize] = useState(savedState.shopSearchSize || 10);

  const [products, setProducts] = useState(savedState.products || []);
  const [cart, setCart] = useState(savedState.cart || {});
  const [productQuery, setProductQuery] = useState(
    savedState.productQuery || ""
  );
  const [productCategory, setProductCategory] = useState(
    savedState.productCategory || "All"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setShopDetails } = useCustomer();

  // ---------------- FETCH SHOPS ----------------

  const fetchShopData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let location = userLocation;

      // Location is used only for distance filtering and distance labels.
      // No map or navigation is created.
      if (!location && navigator.geolocation) {
        location = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            () => resolve({ lat: 22.5892, lng: 88.4215 }),
            { timeout: 5000 }
          );
        });

        setUserLocation(location);
      }

      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/getShopData`,
        {
          withCredentials: true,
          params: {
            shopSearch,
            shopDistanceRange: Number(shopDistanceRange),
            shopCategory: shopCategory === "All" ? "" : shopCategory,
            shopPage: Number(shopPage),
            shopSize: Number(shopSearchSize),
            userLatitude: Number(location?.lat ?? 22.5892),
            userLongitude: Number(location?.lng ?? 88.4215),
            
          },
        }
      );

      setShops(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setShops([]);
      setError("Unable to load shops. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    shopSearch,
    shopCategory,
    shopDistanceRange,
    shopPage,
    shopSearchSize,
    userLocation,
  ]);

  // ---------------- FETCH CATEGORIES ----------------

  const handleGetCategories = async () => {
    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getAllShopCategories`
      );
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  // ---------------- FETCH CART ----------------

  const handleGetCartData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/getCartQuantities`,
        {
          withCredentials: true,
          params: { shopId },
        }
      );

      setCart(res.data || {});
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  }, [shopId]);

  // ---------------- CART ACTIONS ----------------

  const deleteCartItems = async (targetShopId) => {
    try {
      await axios.post(
        `${LINKS.API_BASE_URL}/api/customer/deleteCartItems`,
        null,
        {
          withCredentials: true,
          params: { shopId: Number(targetShopId) },
        }
      );

      await handleGetCartData();
    } catch (err) {
      console.error("Error clearing cart:", err);
      alert("Unable to clear cart. Please try again.");
    }
  };

  const addOrDeleteToCart = async (product, cartTask) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${LINKS.API_BASE_URL}/api/customer/addOrDeleteToCart`,
        null,
        {
          withCredentials: true,
          params: {
            shopId: Number(product.shopId),
            productId: Number(product.productId),
            productPrice: Number(product.price),
            cartTask,
          },
        }
      );

      if (res.data === "clearCart") {
        const accepted = window.confirm(
          "Your cart contains items from another shop. Clear the existing cart and continue?"
        );

        if (accepted) {
          await deleteCartItems(product.shopId);
          return;
        }

        return;
      }

      await handleGetCartData();
    } catch (err) {
      console.error("Cart update failed:", err);
      alert("Unable to update your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH PRODUCTS ----------------

  const fetchShopProducts = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/getShopProducts`,
        {
          params: {
            shopId,
            page: 0,
            size: 10,
            category: productCategory,
            search: productQuery,
          },
        }
      );

      setProducts(res.data?.productDTOList || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, productCategory, productQuery]);

  // ---------------- FETCH SHOP SUBCATEGORIES ----------------

  const fetchSelectedShopCategories = useCallback(async () => {
    if (!shopId) {
      setSelectedShopSubCategories([]);
      return;
    }

    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/getSelectedShopSubCategories`,
        { params: { shopId } }
      );

      setSelectedShopSubCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching shop categories:", err);
      setSelectedShopSubCategories([]);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  useEffect(() => {
    handleGetCategories();
  }, []);

  useEffect(() => {
    handleGetCartData();
  }, [handleGetCartData]);

  useEffect(() => {
    fetchShopProducts();
  }, [fetchShopProducts]);

  useEffect(() => {
    fetchSelectedShopCategories();
  }, [fetchSelectedShopCategories]);

  // ---------------- SAVE PAGE STATE ----------------

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        categories,
        userLocation,
        shops,
        shopId,
        selectedShopName,
        selectedShopSubCategories,
        shopSearch,
        shopCategory,
        shopDistanceRange,
        shopPage,
        shopSearchSize,
        products,
        cart,
        productQuery,
        productCategory,
      })
    );
  }, [
    categories,
    userLocation,
    shops,
    shopId,
    selectedShopName,
    selectedShopSubCategories,
    shopSearch,
    shopCategory,
    shopDistanceRange,
    shopPage,
    shopSearchSize,
    products,
    cart,
    productQuery,
    productCategory,
  ]);

  // ---------------- SELECT SHOP ----------------

  const selectShop = (shop) => {
    setShopId(shop.id);
    setSelectedShopName(shop.shopName);
    setProductQuery("");
    setProductCategory("All");
  };

  const handleShopDetails = (shop) => {
    localStorage.setItem("shopDetails", JSON.stringify(shop));
    setShopDetails(shop);
    navigate("/customer/nearby-shops");
  };

  return (
    <main className="nearshop-page">
      {loading && <Loading />}

      <section className="nearshop-heading">
        <div>
          <span className="nearshop-eyebrow">Subscribed</span>
          <h1 className="page-title">Local stores</h1>
          <p className="page-subtitle">
            Find your stores
          </p>
        </div>
        <div className="nearshop-heading-icon">
          <FaStore />
        </div>
      </section>

      {/* SHOP SEARCH AND FILTERS */}
      <section className="shop-search-panel">
        <div className="shop-search-input-wrap">
          <FaSearch />
          <input
            type="search"
            className="shop-search-input"
            placeholder="Search shops by name..."
            value={shopSearch}
            onChange={(e) => {
              setShopSearch(e.target.value);
              setShopPage(0);
              setShopView(false);
            }}
          />
        </div>

        <select
          aria-label="Filter by shop category"
          value={shopCategory}
          onChange={(e) => {
            setShopCategory(e.target.value);
            setShopPage(0);
          }}
          className="shop-filter-select"
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by distance"
          value={shopDistanceRange}
          onChange={(e) => {
            setShopDistanceRange(Number(e.target.value));
            setShopPage(0);
          }}
          className="shop-filter-select"
        >
          {shopDistances.map((distance) => (
            <option key={distance} value={distance}>
              Within {distance} km
            </option>
          ))}
        </select>
      </section>

      {/* SHOP CARDS */}
      { !shopView && 
      <section className="shops-section">
        <div className="section-heading">
          <div>
            {/* <h2>Local stores</h2> */}
            <p>Choose a shop to explore its products.</p>
          </div>
          <span className="result-count">
            {shops.length} {shops.length === 1 ? "shop" : "shops"}
          </span>
        </div>

        {error && (
          <div className="nearshop-error">
            {error}
            <button type="button" onClick={fetchShopData}>
              Retry
            </button>
          </div>
        )}

        {!error && !loading && shops.length === 0 && (
          <div className="nearshop-empty">
            <FaStore />
            <h3>No shops found</h3>
            <p>Try another name, category, or distance.</p>
          </div>
        )}

        <div className="shop-card-grid" >
          {shops.map((shop) => {
            const distance = getDistanceKm(
              userLocation?.lat,
              userLocation?.lng,
              shop.latitude,
              shop.longitude
            );

            const isSelected = Number(shopId) === Number(shop.id);

            return (
              <article
                key={shop.id} 
                onClick={() => {
    setShopView(true);
  }}
                className={`shop-card-near-shop ${
                  isSelected ? "active" : ""
                }`}
              >
                <button
                  type="button"
                  className="shop-card-select"
                  onClick={() => selectShop(shop)}
                  aria-pressed={isSelected}
                >
                  <div className="shop-avatar">
                    {shop.logoUrl || shop.logo_url ? (
                      <img
                        src={shop.logoUrl || shop.logo_url}
                        alt={`${shop.shopName} logo`}
                      />
                    ) : (
                      <FaStore />
                    )}
                  </div>

                  <div className="shop-main">
                    <h3>{shop.shopName}</h3>
                    <p className="category">{shop.categoryName}</p>

                    <div className="shop-meta">
                      <span className="rating">
                        <FaStar />
                        {shop.rating ?? "New"}
                      </span>

                      {distance !== null && (
                        <span className="distance">
                          {distance} km away
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* <button
                  type="button"
                  className="view-shop-btn"
                  onClick={() => handleShopDetails(shop)}
                >
                  View shop
                </button> */}
              </article>
            );
          })}
        </div>

        {/* Basic pagination */}
        <div className="shop-pagination">
          <button
            type="button"
            disabled={shopPage === 0}
            onClick={() => setShopPage((page) => Math.max(0, page - 1))}
          >
            Previous
          </button>
          <span>Page {shopPage + 1}</span>
          <button
            type="button"
            disabled={shops.length < shopSearchSize}
            onClick={() => setShopPage((page) => page + 1)}
          >
            Next
          </button>
        </div>
      </section>}

      {/* PRODUCTS */}
      {shopView && 
      <section className="product-container">
        <div className="section-heading product-section-heading">
          <div>
            <span className="nearshop-eyebrow">SHOP THE COLLECTION</span>
            <h2>{selectedShopName}</h2>
            <p>
              {shopId
                ? "Find your favourites and add them to your cart."
                : "Select a shop above to browse available products."}
            </p>
          </div>

          <button
            type="button"
            className="cart-summary-button"
            onClick={() => navigate("/customer/cart")}
          >
            <FaShoppingCart />
            My Cart
          </button>
        </div>

        <div className="product-toolbar">
          <div className="product-search-wrap">
            <FaSearch />
            <input
              type="search"
              placeholder="Search products..."
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="product-category-select"
            aria-label="Filter products by category"
          >
            <option value="All">All product categories</option>
            {selectedShopSubCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {!shopId ? (
          <div className="nearshop-empty product-empty">
            <FaStore />
            <h3>Choose your favourite shop</h3>
            <p>Select a local store to see its products here.</p>
          </div>
        ) : products.length === 0 && !loading ? (
          <div className="nearshop-empty product-empty">
            <FaSearch />
            <h3>No products found</h3>
            <p>Try another search or product category.</p>
          </div>
        ) : (
          <div className="product-card-container">
            {products.map((product) => (
              <article
                key={product.productId ?? product.id}
                className="product-card"
              >
                <div className="product-image-wrap">
                  <img
                    className="product-image"
                    loading="lazy"
                    src={product.imageLink || "/placeholder-product.png"}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholder-product.png";
                    }}
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className="product-description">
                      {product.description}
                    </p>
                  )}
                  <p className="product-price">
                    ₹{Number(product.price).toFixed(2)}
                  </p>
                </div>

                <div className="cart-controls">
                  {cart[product.productId] ? (
                    <>
                      <button
                        type="button"
                        aria-label={`Remove one ${product.name}`}
                        onClick={() =>
                          addOrDeleteToCart(product, "delete")
                        }
                      >
                        −
                      </button>
                      <span>{cart[product.productId]}</span>
                      <button
                        type="button"
                        aria-label={`Add one ${product.name}`}
                        onClick={() =>
                          addOrDeleteToCart(product, "add")
                        }
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={() => addOrDeleteToCart(product, "add")}
                    >
                      Add to cart
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}
    </main>
  );
}
