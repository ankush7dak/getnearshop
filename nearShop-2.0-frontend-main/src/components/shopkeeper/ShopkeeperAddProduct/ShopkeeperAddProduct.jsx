import { useState, useEffect } from "react";
import "./ShopkeeperAddProduct.css";
import { FaUpload, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";
import AddSubCategoryModal from "./AddSubCategoryModal/AddSubCategoryModal";
import Loading from "../../Loading/Loading";


export default function ShopkeeperAddProduct() {

  const [form, setForm] = useState({
    name: "",
    shopSubcategoryName: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    weight: "",
    isAvailable: true,
    productImage: null
  });

  const [subcategories, setSubcategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);


  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${LINKS.API_BASE_URL}/api/shop/getShopSubCategories`,
        { withCredentials: true }
      );

      console.log("categories", response.data);
      setSubcategories(response.data);
    } catch (e) {
      console.log("error", e);
    }
  };
  // Fetch shop subcategories (based on logged in shopkeeper)
  useEffect(() => {
    fetchSubCategories();
  }, []);

  // const handleGetSubCategories = async () =>{
  //   try{
  //     const response = await axios.get(
  //         `${LINKS.API_BASE_URL}/api/shop/getShopSubCategories`,{
  //   withCredentials: true
  // }
  //       );
  //       console.log("categories" + response.data);
  //       setSubcategories(response.data);
  //   }
  //   catch(e){
  //     console.log('error');
  //   }
  // }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      productImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.productImage == null) {
      alert("Please Add Product Image!!");
      return;
    }
    setLoading(true);
    const payload = {
      name: form.name,
      shopSubcategoryName: form.shopSubcategoryName,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      cost: Number(form.cost),
      weight: form.weight,
      isAvailable: form.isAvailable,
      productImage: form.productImage
    };

    const data = new FormData();
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
        data.append(key, value); // FormData handles files automatically
      }
    });
    for (let pair of data.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/shop/addProduct`, data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        },
      );
      alert(res.data);

      setForm({
        name: "",
        shopSubcategoryName: "",
        description: "",
        price: "",
        stock: "",
        cost : "",
        weight: "",
        isAvailable: true,
        productImage: null
      });

      setImage(null);
      setPreview(null);

    } catch (error) {
      console.log(error);
      alert("Error adding product ❌");
    }
    setLoading(false);
  };

  return (
    <>
      {showModal && (
        <AddSubCategoryModal setShowModal={setShowModal} refreshSubCategories={fetchSubCategories}></AddSubCategoryModal>
      )}
      <div className={showModal ? "blurred" : ""}>
        <ShopkeeperTopNav />

        <div className="add-product-page">

          <header className="page-header">
            <h2>➕ Add New Product</h2>
            <p>Create a new product listing for your store</p>
          </header>
          {loading && (
            <Loading></Loading>
          )}
          <form className="product-form" onSubmit={handleSubmit}>

            {/* Image Upload (Optional Feature) */}
            <div className="image-section">
              <label className="upload-box">
                {preview ? (
                  <img src={preview} alt="preview" />
                ) : (
                  <>
                    <FaUpload />
                    <span>Upload Product Image</span>
                  </>
                )}
                <input type="file" accept="image/*" name="productImage" onChange={handleImageUpload} hidden />
              </label>
            </div>

            <div className="form-grid">

              <div>
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="sub-category-1">
                  <label>Subcategory *</label>
                  <div className="sub-category-2"><button className="btn-add-category" onClick={() => setShowModal(true)} >Add New</button></div>
                </div>
                <select
                  name="shopSubcategoryName"
                  value={form.shopSubcategoryName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Cost Price (₹) *</label>
                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Product Description *</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Weight in gm/kg *</label>
                <input
                  type="text"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-footer">

              <label className="toggle">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Available for Sale
              </label>

              <div className="btn-group">
                <button type="reset" className="cancel">
                  <FaTimes /> Reset
                </button>

                <button type="submit" className="save" disabled={loading}>
                  {loading ? "Saving..." : <> <FaSave /> Save Product </>}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

    </>
  );
}
