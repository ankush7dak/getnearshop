import { useEffect, useState } from "react";
import "./ShopkeeperProfile.css";
import {
  FaStore,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaCreditCard,
  FaLock,
  FaSave,
  FaEdit,
} from "react-icons/fa";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";

export default function ShopkeeperProfile() {
  const [profile, setProfile] = useState({
    ownerName: "",
    email: "",
    phone: "",
    shopName: "",
    shopCategory: "",
    shopId: "",
    address: "",
    city: "",
    pincode: "",
    openTime: "",
    closeTime: "",
    upi: "",
    bank: "",
    account: "",


  });
  const [loading,setLoading] = useState(false);
  const [categories,setCategories] = useState([]);
  const [disabled,setDisabled] = useState(true);
  const fetchShopProfileData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${LINKS.API_BASE_URL}/api/shop/getShopProfile`,
        { withCredentials: true });
      if (res.data) {
        const userDTO = res.data.userDTO;
        const shopDTO = res.data.shopDTO;
        const address = shopDTO.address.split('$');
        console.log('res active' + shopDTO.isActive);
        setProfile({
          ownerName: userDTO.name,
          email: userDTO.email,
          phone: userDTO.mobile,
          shopName: shopDTO.shopName,
          shopCategory: shopDTO.categoryName,
          shopId: shopDTO.id,
          address: address[0],
          city: address[1],
          pincode: address[3],
          openTime: shopDTO.openingTime,
          closeTime: shopDTO.closingTime,
          status: shopDTO.status,
          providesDelivery : shopDTO.providesDelivery,
          deliveryRange : shopDTO.deliveryRange,
          upi: "",
          bank: "",
          account: "",
          isActive : shopDTO.isActive
        });
      }
      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }
  
  const handleEdit = ()=>{
    setDisabled(false);
  }

  const handleGetCategories = async () => {
    const response = await axios.get(
      `${LINKS.API_BASE_URL}/api/shop/getAllShopCategories`
    );
    console.log("categories" + response.data);
    setCategories(response.data);
  }


  useEffect(() => {
    fetchShopProfileData();
    handleGetCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('isactive' + profile.isActive)
    const userDTO = {
    name : profile.ownerName,
    email : profile.email,
    mobile : profile.mobile,
    };
    const shopDTO = {
        shopName : profile.shopName,
        email : profile.email,
        description : profile.description,
        openingTime : profile.openTime,
        closingTime : profile.closeTime,
        address : profile.address + '$' + profile.city+ '$' + profile.state + '$' +  profile.pincode,
        categoryName : profile.shopCategory,
        providesDelivery : profile.providesDelivery,
        deliveryRange : profile.deliveryRange,
        isActive : profile.isActive

    }
    try{
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/shop/updateShopProfile`, { userDTO, shopDTO }, {
        withCredentials: true,
      });
      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
    setDisabled(true);
    setLoading(false);
    
  };

  return (
    <>
      <ShopkeeperTopNav />
      <div className="shop-profile-page">
        
        <h2>🏪 Shopkeeper Profile & Store Settings</h2>
        <button  className="btnp" onClick={handleEdit} >
              <FaEdit color="blue"/> Edit
            </button>
            {loading && (<Loading></Loading>)}
        <form onSubmit={handleSubmit}>

          {/* Owner Info */}
          <section className="profile-card">
            <h3><FaUser /> Owner Details</h3>

            <div className="grid">

              <div className="form-group">
                <label htmlFor="ownerName">Owner Name</label>
                <input
                  id="ownerName"
                  name="ownerName"
                  value={profile.ownerName}
                  onChange={handleChange}
                  required
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  required
                  disabled = {disabled}

                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>

            </div>
          </section>

          {/* Shop Info */}
          <section className="profile-card">
            <h3><FaStore /> Shop Details</h3>

            <div className="grid">

              <div className="form-group">
                <label htmlFor="shopName">Shop Name</label>
                <input
                  id="shopName"
                  name="shopName"
                  value={profile.shopName}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="shopCategory">Category</label>
                <select
                  id="shopCategory"
                  name="shopCategory"
                  value={profile.shopCategory}
                  onChange={handleChange}
                  disabled = {disabled}
                >
                  {categories.map(category => <option>{category}</option>)}
                  
                  
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="shopId">Shop ID</label>
                <input
                  id="shopId"
                  name="shopId"
                  value={profile.shopId}
                  readOnly
                />
              </div>

            </div>
          </section>

          {/* Address */}
          <section className="profile-card">
            <h3><FaMapMarkerAlt /> Address</h3>

            <div className="grid">

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

            </div>
          </section>

          {/* Timings */}
          <section className="profile-card">
            <h3><FaClock /> Business Hours</h3>

            <div className="grid">

              <div className="form-group">
                <label htmlFor="openTime">Open Time</label>
                <input
                  type="time"
                  id="openTime"
                  name="openTime"
                  value={profile.openTime}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="closeTime">Close Time</label>
                <input
                  type="time"
                  id="closeTime"
                  name="closeTime"
                  value={profile.closeTime}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

            </div>
          </section>

          {/* Payments */}
          <section className="profile-card">
            <h3><FaCreditCard /> Payment Info</h3>

            <div className="grid">

              <div className="form-group">
                <label htmlFor="upi">UPI ID</label>
                <input
                  id="upi"
                  name="upi"
                  value={profile.upi}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bank">Bank Name</label>
                <input
                  id="bank"
                  name="bank"
                  value={profile.bank}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="account">Account Number</label>
                <input
                  id="account"
                  name="account"
                  value={profile.account}
                  onChange={handleChange}
                  disabled = {disabled}
                />
              </div>

            </div>
          </section>

          {/* Controls */}
          <section className="profile-card">
            <h3><FaLock /> Controls</h3>

            <div className="toggle-row">
              <label>
                <div className="dir-column">
                  <div>
                    <input
                      type="checkbox"
                      name="providesDelivery"
                      checked={profile.providesDelivery}
                      value={profile.providesDelivery}
                      onChange={handleChange}
                      disabled = {disabled}
                    />
                    Enable Delivery
                  </div>
                  {profile.providesDelivery && (
                    <div className="label-data">
                      <input
                        type="number"
                        name="deliveryRange"
                        checked={profile.providesDelivery}
                        value={profile.deliveryRange}
                        onChange={handleChange}
                        placeholder="Enter delivery range in kms"
                        disabled = {disabled}
                      />
                    </div>
                  )}
                </div>

              </label>

              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!profile.isActive}
                  onChange={handleChange}
                  value={!profile.isActive}
                  disabled = {disabled}
                />
                Vacation Mode
              </label>
            </div>
          </section>

          {/* Save */}
          
          <div className="save-row">
            <button type="submit" disabled = {disabled} className="btn">
              <FaSave /> Save Changes
            </button>
          </div>

        </form>
        
      </div>
    </>
  );
}