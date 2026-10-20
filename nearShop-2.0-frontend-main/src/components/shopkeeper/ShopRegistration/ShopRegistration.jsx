import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import "./ShopRegistration.css";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import { LINKS } from "../../../constants/LinksUtility";
import { useNavigate } from "react-router-dom";

/* Fix Leaflet marker icon issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const ShopRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: "",
    mobile: "",
    email: "",
    description: "",
    openingTime: "",
    closingTime: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    categoryName: "",
    logo: null,
  });

  const [loadingPincode, setLoadingPincode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [categories, setCategories] = useState([]);

  const indiaCenter = [20.5937, 78.9629];

  /* ===========================
     Get Current Location
  ============================ */
  const handleGetCategories = async () => {
    const response = await axios.get(
      `${LINKS.API_BASE_URL}/api/shop/getAllShopCategories`
    );
    console.log("categories" + response.data);
    setCategories(response.data);
  }

  useEffect(()=>{
    handleGetCategories();
  },[])
  const handleOpenMap = () => {
    setShowMap(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setMarkerPosition([lat, lng]);

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }));
        },
        (error) => {
          console.error("Location error:", error);
          alert("Please allow location access.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition([
        parseFloat(formData.latitude),
        parseFloat(formData.longitude),
      ]);
    }
  }, [formData.latitude, formData.longitude]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    console.log(name + value);

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      return;
    }

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;
    if (name === "pincode" && !/^\d{0,6}$/.test(value)) return;

    setFormData({ ...formData, [name]: value });

    if (name === "pincode" && value.length === 6) {
      try {
        setLoadingPincode(true);

        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${value}`
        );

        if (response.data[0].Status === "Success") {
          const postOffice = response.data[0].PostOffice[0];

          setFormData((prev) => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
          }));
        } else {
          alert("Invalid Pincode");
        }
      } catch (error) {
        console.error("Error fetching pincode:", error);
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  /* Click to select location */
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setMarkerPosition([lat, lng]);

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
      },
    });

    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  /* Change Map View Dynamically */
  const ChangeMapView = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
  };

  /* Search control */
  const SearchControl = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider: provider,
        style: "bar",
        showMarker: false,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        searchLabel: "Search location...",
        keepResult: true,
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", (result) => {
        const { x, y } = result.location;

        setMarkerPosition([y, x]);

        setFormData((prev) => ({
          ...prev,
          latitude: y.toFixed(6),
          longitude: x.toFixed(6),
        }));
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobile.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }

    if (formData.pincode.length !== 6) {
      alert("Pincode must be 6 digits");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Please select shop location from map");
      return;
    }
    console.log("formdata " + formData);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        data.append(key, value); // FormData handles files automatically
      }
    });
    for (let pair of data.entries()) {
      console.log(pair[0], pair[1]);
    }
    try {
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/shop/registorShop`, data, {
        withCredentials: true
      });
        if (res.data === true) {
          alert("Shop Registered Successfully! click on ok to move to Dashboard");
          navigate("/shopkeeper/dashboard");
        }
    } catch (error) {
      console.log(error);
      alert("Registration Failed");
    }
  };

  return (
    <>
      <ShopkeeperTopNav />
      <div className="shop-form-container">
        <h2>Shop Registration</h2>

        <form onSubmit={handleSubmit} className="shop-form">

          <div className="form-group">
            <label>Shop Name</label>
            <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="time-row">
            <div className="form-group">
              <label>Opening Time</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Closing Time</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="row">
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
              {loadingPincode && <small>Fetching city/state...</small>}
            </div>

            <div className="form-group">
              <label>City</label>
              <input type="text" value={formData.city} readOnly />
            </div>

            <div className="form-group">
              <label>State</label>
              <input type="text" value={formData.state} readOnly />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Latitude</label>
              <input type="text" value={formData.latitude} readOnly />
            </div>

            <div className="form-group">
              <label>Longitude</label>
              <input type="text" value={formData.longitude} readOnly />
            </div>
          </div>

          <div className="form-group">
            <button type="button" onClick={handleOpenMap} className="map-button">
              📍 Select Shop Location on Map
            </button>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="categoryName" value={formData.categoryName} onChange={handleChange}  required>
              <option value="">Select Category</option>
              {categories.map((item) => {
                return <option value={item}>{item}</option>
              })}

            </select>
          </div>

          <div className="form-group">
            <label>Shop Logo</label>
            <input type="file" name="logo" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit">Register Shop</button>

        </form>
      </div>

      {showMap && (
        <div className="map-modal">
          <div className="map-container">
            <div className="map-header">
              <h3>Select Shop Location</h3>
              <button onClick={() => setShowMap(false)}>Close ✖</button>
            </div>

            <MapContainer
              center={markerPosition || indiaCenter}
              zoom={markerPosition ? 15 : 5}
              style={{ width: "100%", height: "400px" }}
            >
              <ChangeMapView
                center={markerPosition || indiaCenter}
                zoom={markerPosition ? 15 : 5}
              />

              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <SearchControl />
              <LocationSelector />
            </MapContainer>

          </div>
        </div>
      )}
    </>
  );
};

export default ShopRegistration;