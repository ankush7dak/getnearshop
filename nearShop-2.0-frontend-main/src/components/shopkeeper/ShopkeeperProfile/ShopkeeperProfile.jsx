
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaStore,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaCreditCard,
  FaLock,
  FaSave,
  FaEdit,
  FaCamera,
  FaTimes,
  FaUndo,
  FaTruck,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import "./ShopkeeperProfile.css";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";
// import {setCurrShopName} from useCustomer(customerco);

import { useCustomer } from "../../customer/CustomerContext/CustomerContext";
import { compressImage } from "../../../Utils/imageCompression";
const INITIAL_PROFILE = {
  ownerName: "",
  email: "",
  phone: "",
  shopName: "",
  shopCategory: "",
  shopId: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  openTime: "",
  closeTime: "",
  providesDelivery: false,
  deliveryRange: "",
  isActive: true,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ShopkeeperProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(INITIAL_PROFILE);

  const {setCurrShopName,setShopActive} = useCustomer();


  const [categories, setCategories] = useState([]);

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  //hello_ak


  // Fetch shop profile
  const fetchShopProfileData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getShopProfile`,
        { withCredentials: true }
      );

      const userDTO = res.data.userDTO;
      const shopDTO = res.data.shopDTO;
      

      const addressParts = (shopDTO.address || "").split("$");

      const fetchedProfile = {
        ownerName: userDTO.name || "",
        email: userDTO.email || "",
        phone: userDTO.mobile || "",
        logoUrl : res.data.logoUrl,
        shopName: shopDTO.shopName || "",
        shopCategory: shopDTO.categoryName || "",
        shopId: shopDTO.id || "",

        description: shopDTO.description || "",

        address: addressParts[0] || "",
        city: addressParts[1] || "",
        state: addressParts[2] || "",
        pincode: addressParts[3] || "",

        openTime: (shopDTO.openingTime || "").substring(0, 5),
        closeTime: (shopDTO.closingTime || "").substring(0, 5),

        providesDelivery: Boolean(shopDTO.providesDelivery),
        deliveryRange: shopDTO.deliveryRange ?? "",

        isActive: shopDTO.isActive ?? true,
      };

      setProfile(fetchedProfile);
      setOriginalProfile(fetchedProfile);

      // Change this mapping if your ShopDTO uses another property.
     const newLogoUrl =
  res.data.logoUrl ||
  shopDTO.logoUrl ||
  shopDTO.logo ||
  shopDTO.imageUrl ||
  "";

setImageUrl(newLogoUrl);

      setImagePreview("");
      setImageFile(null);

    } catch (err) {
      console.error("Error fetching shop profile:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load shop profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch shop categories
  const handleGetCategories = async () => {
    try {
      const response = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getAllShopCategories`,
        { withCredentials: true }
      );

      setCategories(response.data || []);

    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchShopProfileData();
    handleGetCategories();
  }, []);

  // Release temporary image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Generic input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // Select shop profile image
  const handleImageChange = async (e) => {
    let file = e.target.files?.[0];
    file = await compressImage(file);
    file = await compressImage(file);


    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove selected image and restore saved image
  const handleCancelImage = () => {
    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Enter edit mode
  const handleEdit = () => {
    setDisabled(false);
    setError("");
    setSuccess("");
  };

  // Cancel all changes
  const handleCancel = () => {
    setProfile(originalProfile);
    setImageFile(null);
    setImagePreview("");
    setDisabled(true);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (
      profile.providesDelivery &&
      (!profile.deliveryRange ||
        Number(profile.deliveryRange) <= 0)
    ) {
      setError("Please enter a valid delivery range.");
      return;
    }

    if (
      profile.openTime &&
      profile.closeTime &&
      profile.openTime >= profile.closeTime
    ) {
      setError("Closing time must be later than opening time.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // User details
      formData.append("userDTO.name", profile.ownerName);
      formData.append("userDTO.email", profile.email);

      // Shop details
      formData.append("shopDTO.shopName", profile.shopName);
      formData.append("shopDTO.description", profile.description || "");
      formData.append("shopDTO.categoryName", profile.shopCategory);

      formData.append(
        "shopDTO.address",
        [
          profile.address,
          profile.city,
          profile.state,
          profile.pincode,
        ].join("$")
      );

      formData.append(
        "shopDTO.openingTime",
        profile.openTime
      );

      formData.append(
        "shopDTO.closingTime",
        profile.closeTime
      );

      formData.append(
        "shopDTO.providesDelivery",
        String(profile.providesDelivery)
      );

      formData.append(
        "shopDTO.deliveryRange",
        profile.providesDelivery
          ? String(profile.deliveryRange)
          : "0"
      );

      formData.append(
        "shopDTO.isActive",
        String(profile.isActive)
      );

      // Shop logo - only append when a new image is selected
      if (imageFile) {
        formData.append("logo", imageFile);
      }

      const res = await axios.post(
        `${LINKS.API_BASE_URL}/api/shop/updateShopProfile`,
        formData,
        {
          withCredentials: true,
        }
      );
      setCurrShopName( profile.shopName);
      setShopActive(profile.isActive);

      setSuccess("Shop profile updated successfully!");

      // Refresh saved profile and image URL from backend
      await fetchShopProfileData();

      setDisabled(true);
      setImageFile(null);
      setImagePreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Error updating shop profile:", err);

      setError(
        err.response?.data?.message ||
        "Failed to update shop profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const displayedImage = imagePreview || imageUrl;

  return (
    <div className="shop-profile-page">

      {loading && <Loading />}

      <div className="shop-profile-header">
        <div>
          <h2>Shop Profile & Settings</h2>
          <p>Manage your store information and preferences.</p>
        </div>

        {disabled ? (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={handleEdit}
            disabled={loading}
          >
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <button
            type="button"
            className="profile-cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            <FaUndo /> Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="profile-alert error-alert">
          <FaExclamationCircle />
          {error}
        </div>
      )}

      {success && (
        <div className="profile-alert success-alert">
          <FaCheckCircle />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* SHOP IMAGE AND BASIC INFORMATION */}

        <section className="profile-card shop-image-section">

          <div className="shop-image-container">

            <div className="shop-image-wrapper">

              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Shop profile"
                  className="shop-profile-image"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="shop-image-placeholder">
                  <FaStore />
                </div>
              )}

              {!disabled && (
                <button
                  type="button"
                  className="shop-image-edit"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change shop image"
                >
                  <FaCamera />
                </button>
              )}

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleImageChange}
              disabled={disabled}
            />

            <div className="shop-image-info">
              <h3>{profile.shopName || "Your Shop"}</h3>
              <p>Shop ID: {profile.shopId || "N/A"}</p>

              {!disabled && (
                <div className="shop-image-actions">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="image-upload-btn"
                  >
                    <FaCamera /> Change Image
                  </button>

                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleCancelImage}
                      className="image-remove-btn"
                    >
                      <FaTimes /> Undo Image
                    </button>
                  )}
                </div>
              )}

              <small>JPG, PNG or WebP. Maximum size 5 MB.</small>
            </div>

          </div>

        </section>

        {/* OWNER DETAILS */}

        <section className="profile-card">

          <h3><FaUser /> Owner Details</h3>

          <div className="grid">

            <div className="form-group">
              <label>Owner Name</label>
              <input
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
                required
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone}
                disabled
              />
            </div>

          </div>

        </section>

        {/* SHOP DETAILS */}

        <section className="profile-card">

          <h3><FaStore /> Shop Details</h3>

          <div className="grid">

            <div className="form-group">
              <label>Shop Name</label>
              <input
                name="shopName"
                value={profile.shopName}
                onChange={handleChange}
                required
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Shop Category</label>

              <select
                name="shopCategory"
                value={profile.shopCategory}
                onChange={handleChange}
                disabled={disabled}
                required
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Shop ID</label>
              <input
                value={profile.shopId}
                disabled
              />
            </div>

            <div className="form-group full-width">
              <label>Shop Description</label>
              <textarea
                name="description"
                value={profile.description}
                onChange={handleChange}
                disabled={disabled}
                rows={3}
                placeholder="Describe your shop..."
              />
            </div>

          </div>

        </section>

        {/* ADDRESS */}

        <section className="profile-card">

          <h3><FaMapMarkerAlt /> Shop Address</h3>

          <div className="grid">

            <div className="form-group">
              <label>Street Address</label>
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={disabled}
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                value={profile.city}
                onChange={handleChange}
                disabled={disabled}
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                name="state"
                value={profile.state}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                name="pincode"
                value={profile.pincode}
                onChange={handleChange}
                disabled={disabled}
                maxLength={6}
                inputMode="numeric"
              />
            </div>

          </div>

        </section>

        {/* BUSINESS HOURS */}

        <section className="profile-card">

          <h3><FaClock /> Business Hours</h3>

          <div className="grid">

            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="openTime"
                value={profile.openTime}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>

            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="closeTime"
                value={profile.closeTime}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>

          </div>

        </section>

        {/* PAYMENT INFORMATION */}

        <section className="profile-card">

          <h3><FaCreditCard /> Payment Information</h3>

          <p className="profile-section-note">
            Payment details are not connected to the current profile update API.
          </p>

          <div className="grid">

            <div className="form-group">
              <label>UPI ID</label>
              <input disabled placeholder="Not configured" />
            </div>

            <div className="form-group">
              <label>Bank Name</label>
              <input disabled placeholder="Not configured" />
            </div>

            <div className="form-group">
              <label>Account Number</label>
              <input disabled placeholder="Not configured" />
            </div>

          </div>

        </section>

        {/* SHOP CONTROLS */}

        <section className="profile-card">

          <h3><FaLock /> Store Controls</h3>

          <div className="shop-controls">

            <div className="control-item">

              <div className="control-description">
                <FaTruck />
                <div>
                  <strong>Enable Delivery</strong>
                  <p>Allow customers to order for home delivery.</p>
                </div>
              </div>

              <input
                type="checkbox"
                name="providesDelivery"
                checked={profile.providesDelivery}
                onChange={handleChange}
                disabled={disabled}
              />

            </div>

            {profile.providesDelivery && (
              <div className="form-group delivery-range">

                <label>Delivery Range (KM)</label>

                <input
                  type="number"
                  name="deliveryRange"
                  min="1"
                  max="100"
                  value={profile.deliveryRange}
                  onChange={handleChange}
                  disabled={disabled}
                  placeholder="Enter delivery range"
                />

              </div>
            )}

            <div className="control-item">

              <div className="control-description">
                <FaStore />
                <div>
                  <strong>Vacation Mode</strong>
                  <p>
                    Temporarily stop showing your shop as available.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={!profile.isActive}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    isActive: !e.target.checked,
                  }))
                }
                disabled={disabled}
              />

            </div>

          </div>

        </section>

        {/* SAVE */}

        {!disabled && (
          <div className="profile-save-row">

            <button
              type="button"
              className="profile-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-btn"
              disabled={loading}
            >
              <FaSave /> Save Changes
            </button>

          </div>
        )}

      </form>

    </div>
  );
}
