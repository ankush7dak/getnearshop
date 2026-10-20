import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaDirections, FaStar } from "react-icons/fa";
import "./NearShopSearchPage.css";
import { useCustomer } from "../CustomerContext/CustomerContext";
import { useNavigate } from "react-router-dom";
import NearShopNavBar from "./NearShopNavBar/NearShopNavBar";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";
import HamburgerMenu from "../../Hamburgers/HamburgerMenu";

/* ---------------- LEAFLET FIX ---------------- */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- CONSTANTS ---------------- */
const STORAGE_KEY = "nearShopSearchPageState";
const shopDistances = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 200, 400, 500];

const loadSavedState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch (e) {
    console.error("Failed to parse saved NearShopSearchPage state:", e);
    return {};
  }
};

/* ---------------- DISTANCE ---------------- */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/* ---------------- MAP HELPERS ---------------- */
function FlyToShop({ shop }) {
  const map = useMap();
  useEffect(() => {
    if (shop) {
      map.flyTo([shop.latitude, shop.longitude], 16, { duration: 1.2 });
    }
  }, [shop, map]);
  return null;
}

function ResizeFix() {
  const map = useMapEvents({});
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
}

function FitRouteBounds({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route.length) {
      map.fitBounds(L.latLngBounds(route), {
        padding: [60, 60],
        animate: true,
      });
    }
  }, [route, map]);
  return null;
}

/* ---------------- MAIN ---------------- */
export default function NearShopSearchPage() {
  const savedState = loadSavedState();

  const [query, setQuery] = useState(savedState.query || "");
  const [category, setCategory] = useState(savedState.category || "All");
  const [categories, setCategories] = useState(savedState.categories || []);
  const [userLocation, setUserLocation] = useState(savedState.userLocation || null);
  const [selectedShop, setSelectedShop] = useState(savedState.selectedShop || null);
  const [routeCoords, setRouteCoords] = useState(savedState.routeCoords || []);
  const [shopDistRange, setShopDistRange] = useState(savedState.shopDistRange || 500);
  const [shops, setShops] = useState(savedState.shops || []);
  const [mapOpen, setMapOpen] = useState(savedState.mapOpen || false);
  const [distance, setDistance] = useState(savedState.distance || 500);
  const [shopId, setShopId] = useState(savedState.shopId || null);
  const [selectedShopName, setSelectedShopName] = useState(savedState.selectedShopName || "Shop Products");
  const [selectedShopSubCategories, setSelectedShopSubCategories] = useState(savedState.selectedShopSubCategories || []);
  const [productCategory, setProductCategory] = useState(savedState.productCategory || "All");

  //shop search
  const [shopSearch, setShopSearch] = useState(savedState.shopSearch || "");
  const [shopCategory, setShopCategory] = useState(savedState.shopCategory || "");
  const [shopDistanceRange, setShopDistanceRange] = useState(savedState.shopDistanceRange || 500);
  const [shopPage, setShopPage] = useState(savedState.shopPage || 0);
  const [shopSearchSize, setShopSearchSize] = useState(savedState.shopSearchSize || 10);
  const [changeCartForShop,setChangeCartForShop] = useState(savedState.changeCartForShop || false);

  //
  const [products, setProducts] = useState(savedState.products || []);
  const [cart, setCart] = useState(savedState.cart || {});
  const [productQuery, setProductQuery] = useState(savedState.productQuery || "");
  const [loading, setLoading] = useState(false);

  const deleteCartItems = async (shopId)=>{
    try{
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/customer/deleteCartItems`,null,
        {
          withCredentials: true,
          params: {
            shopId: Number(shopId),
            
          }
        }
      );
      alert("Cart Cleared!!");
       handleGetCartData();
    }catch(e){
      alert(e);
    }
  }

  const addOrDeleteToCart = async (product, cartTask) => {
    setLoading(true);
    try {
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/customer/addOrDeleteToCart`,null,
        {
          withCredentials: true,
          params: {
            shopId: Number(product.shopId),
            productId: Number(product.productId),
            productPrice: Number(product.price),
            cartTask: cartTask
          }
        }
      );
      if(res.data == 'clearCart'){
        const userAccepted = window.confirm("Do you want to delete cart items of another shop as you are selection product from different shop!!");
        if(userAccepted){
          deleteCartItems(product.shopId);
        }
      }
      handleGetCartData();
      console.log(res);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const handleGetCartData = async ()=>{
    try{
      setLoading(true);
      const res = await axios.get(`${LINKS.API_BASE_URL}/api/customer/getCartQuantities`,{
        withCredentials: true,
        params :{
          shopId : shopId
        }
      });
      setCart(res.data);
    }catch(e){
      console.log(e);
    }
    setLoading(false);
  }
  useEffect(()=>{
    handleGetCartData();
  },[shopId])

  const navigate = useNavigate();
  const { setShopDetails } = useCustomer();


  useEffect(() => {
    if (savedState.userLocation) {
      setUserLocation(savedState.userLocation);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () =>
        setUserLocation({
          lat: 22.5892,
          lng: 88.4215,
        })
    );
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            reject(error.message);
          }
        );
      }
    });
  };
  /* ---------- FETCH SHOPS ---------- */
  const fetchShopData = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();

      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/getShopData`,
        {
          withCredentials: true,
          params: {
            shopSearch: shopSearch,
            shopDistanceRange: Number(shopDistanceRange),
            shopCategory: (shopCategory == 'All') ? "" : shopCategory,
            shopPage: Number(shopPage),
            shopSize: Number(shopSearchSize),
            userLatitude: Number(location.lat),
            userLongitude: Number(location.lng)
          }
        }
      );
      console.log(res.data);
      setShops(res.data);
    } catch (e) {
      console.error("Error fetching shops:", e);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [shopSearch, shopPage, shopCategory, shopDistanceRange])

  /* ---------- FETCH CATEGORIES ---------- */
  const handleGetCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getAllShopCategories`
      );
      setCategories(res.data || []);
    } catch (e) {
      console.error("Category fetch error:", e);
      setCategories([]);
    }
    setLoading(false);
  };

  const fetchShopProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${LINKS.API_BASE_URL}/api/customer/getShopProducts`, {
        params: {
          shopId: shopId,
          page: 0,
          size: 10,
          category: productCategory,
          search: productQuery

        }
      });
      console.log(res.data);
      setProducts(res.data.productDTOList);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchShopProducts();
  }, [shopId, productCategory, productQuery])

  const fetchSelectedShopCategories = async () => {
    try {
      setLoading(true);
      const categoriesOfShop = await axios.get(`${LINKS.API_BASE_URL}/api/customer/getSelectedShopSubCategories`, {
        params: {
          shopId: shopId
        }
      });

      console.log(categoriesOfShop.data);
      setSelectedShopSubCategories(categoriesOfShop.data);
    }
    catch (e) {

    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSelectedShopCategories();
  }, [shopId]);


  useEffect(() => {
    fetchShopData();
    handleGetCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query,
        category,
        categories,
        userLocation,
        selectedShop,
        routeCoords,
        shopDistRange,
        shops,
        mapOpen,
        distance,
        shopId,
        selectedShopName,
        selectedShopSubCategories,
        productCategory,
        shopSearch,
        shopCategory,
        shopDistanceRange,
        shopPage,
        shopSearchSize,
        changeCartForShop,
        products,
        cart,
        productQuery,
      })
    );
  }, [
    query,
    category,
    categories,
    userLocation,
    selectedShop,
    routeCoords,
    shopDistRange,
    shops,
    mapOpen,
    distance,
    shopId,
    selectedShopName,
    selectedShopSubCategories,
    productCategory,
    shopSearch,
    shopCategory,
    shopDistanceRange,
    shopPage,
    shopSearchSize,
    changeCartForShop,
    products,
    cart,
    productQuery,
  ]);

  /* ---------- RESET ROUTE ---------- */
  useEffect(() => {
    setSelectedShop(null);
    setRouteCoords([]);
  }, [query, category, shopDistRange]);

  /* ---------- ROUTE ---------- */
  const fetchRoute = async (shop) => {
    setLoading(true);
    if (!userLocation) return;
    setMapOpen(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${shop.longitude},${shop.latitude}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        setRouteCoords(coords);
        setSelectedShop(shop);
      }
    } catch (err) {
      console.error("Route fetch failed:", err);
    }
    setLoading(false);
  };

  /* ---------- NAV ---------- */
  const handleShopDetails = (shop) => {
    localStorage.setItem("shopDetails", JSON.stringify(shop));
    setShopDetails(shop);
    navigate("/customer/nearby-shops");
  };

  return (
    <>
      {/* <NearShopNavBar /> */}

      {loading && (<Loading></Loading>)}
      <div className="nearshop-page">
        <h1 className="page-title">Your shops</h1>
        <div className="shop-search">
          <input
            className="nav-search"
            placeholder="Search shops..."
            value={shopSearch}
            onChange={(e) => setShopSearch(e.target.value)}
          />

          {/* CATEGORY */}
          <select
            value={shopCategory}
            onChange={(e) => setShopCategory(e.target.value)}
            className="nav-select"
          >
            <option key={"All"}>{"All"}</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* DISTANCE */}
          <select
            value={shopDistanceRange}
            onChange={(e) => setShopDistanceRange(Number(e.target.value))}
            className="nav-select"
          >
            {shopDistances.map((d) => (
              <option key={d} value={d}>
                {d} km
              </option>
            ))}
          </select>
        </div>
        <div className="content-grid">
          {/* LIST */}

          <div className="shop-list">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className={`shop-card-near-shop `}

              >
                <div
                  className="shop-main"
                  onClick={() => {
                    // setShopId(shop.id);
                    setRouteCoords([]);
                    setMapOpen(false);
                    setShopId(shop.id);
                    setSelectedShopName(shop.shopName);

                  }}
                >
                  <h3 >{shop.shopName}</h3>
                  <p className="category">{shop.categoryName}</p>

                  <div className="rating">
                    <FaStar /> {shop.rating || "N/A"}
                  </div>

                  <p className="distance">
                    {shop.latitude != null
                      ? `${getDistanceKm(userLocation.lat, userLocation.lng, shop.latitude, shop.longitude)} km away`
                      : "N/A"}
                  </p>
                </div>


                <button
                  className="direction-btn"
                  onClick={() => fetchRoute(shop)}
                >
                  <FaDirections />
                </button>
              </div>
            ))}
          </div>


          {!mapOpen && (
            <div className="product-container">
              <div className="shop-name">
                <h2 className="selected-shop-name">{selectedShopName}</h2>
              </div>

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search products..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="product-search"
              />
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="product-search"
              >
                <option key={"All"}>{"All"}</option>
                {selectedShopSubCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>


              <div className="product-card-container">
                {products.map((product) => (
                  <div key={product.id} className="product-card">

                    <img className="product-image" loading="lazy" src={`${product.imageLink}`} alt="" />

                    <h4>{product.name}</h4>
                    {/* <p>Category:- {product.shopSubcategoryName !=null? product.shopSubcategoryName:product.subcategoryName}</p> */}
                    <p></p>
                    <p>Price:- ₹{product.price}</p>
                    <p>{product.description}</p>

                    <div className="cart-controls">
                      {cart[product.productId] ? (
                        <>
                          <button onClick={() => addOrDeleteToCart(product, 'delete')}>-</button>
                          <span>{cart[product.productId]}</span>
                          <button onClick={() => addOrDeleteToCart(product, 'add')}>+</button>
                        </>
                      ) : (
                        <button onClick={() => addOrDeleteToCart(product, 'add')}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* MAP */}
          {mapOpen && (
            <div className="map-wrapper">
              <div className="shop-name">
                <h2 className="selected-shop-name">{selectedShopName} Location on Map</h2>
              </div>
              {userLocation && (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={14}
                  className="map leaflet-container"
                >
                  <ResizeFix />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FlyToShop shop={selectedShop} />
                  <FitRouteBounds route={routeCoords} />

                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>

                  {shops.map((shop) => (
                    <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
                      <Popup>
                        <strong>{shop.shopName}</strong>
                        <br />
                        {shop.categoryName}
                        <br />
                        ⭐ {shop.rating || "N/A"}
                        <br />
                        {getDistanceKm(userLocation.lat, userLocation.lng, shop.latitude, shop.longitude)} km away
                      </Popup>
                    </Marker>
                  ))}

                  {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} />
                  )}
                </MapContainer>
              )}
            </div>

          )}
        </div>
      </div>
    </>
  );
}