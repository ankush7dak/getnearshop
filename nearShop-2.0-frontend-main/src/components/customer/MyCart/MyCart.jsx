import React, { useEffect, useState, useMemo } from "react";
import "./MyCart.css";
import axios from "axios";
import { LINKS } from "../../../constants/LinksUtility";
import NearShopNavBar from "../NearByShopSearchPage/NearShopNavBar/NearShopNavBar";
import Loading from "../../Loading/Loading";



  

const MyCart = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cartProducts, setCartProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState(0);

  const DELIVERY_FEE = 30;

  const fetchCartData = async ()=>{
    try{
      setLoading(true);
      const res = await axios.get(`${LINKS.API_BASE_URL}/api/customer/getMyCartData`,{
        withCredentials : true
      });
      if (res.data.length > 0) {
        setCartProducts(res.data);
        setShopId(res.data[0].shopId);
        handleGetCartData(res.data[0].shopId);
      } else {
        setCartProducts([]);
        setShopId(0);
      }
    }catch(e){
      console.error(e);
    }finally{
      setLoading(false);
    }
  }

  const placeOrder = async ()=> {
    try {
      // Validation
      if (cartProducts.length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
      }

      if (totalItems === 0) {
        alert("Please select quantities for items in your cart.");
        return;
      }

      if (!shopId || shopId === 0) {
        alert("Error: Shop information is missing. Please refresh and try again.");
        return;
      }

      // Build order items array
      const orderItems = cartProducts
        .filter(item => cart[item.productId] && cart[item.productId] > 0)
        .map(item => ({
          productId: Number(item.productId),
          productName: item.name,
          price: Number(item.price),
          quantity: Number(cart[item.productId]),
          itemTotal: Number(item.price) * Number(cart[item.productId])
        }));

      if (orderItems.length === 0) {
        alert("No items selected for order. Please add items to cart.");
        return;
      }

      // Build order object
      const orderData = {
        shopId: Number(shopId),
        items: orderItems,
        subtotal: Math.round(subtotal),
        discount: discount,
        discountAmount: Math.round(discountAmount),
        deliveryFee: DELIVERY_FEE,
        totalAmount: Math.round(total),
        couponCode: coupon || null,
        totalItems: totalItems,
        orderDate: new Date().toISOString()
      };

      // Send order to backend
      setLoading(true);
      const response = await axios.post(
        `${LINKS.API_BASE_URL}/api/customer/placeOrder`,
        orderData,
        {
          withCredentials: true
        }
      );

      if (response.data ) {
        // Order created successfully - show payment modal
        alert("Order created successfully");
        window.location.reload();
        //setShowPayment(true);
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to place order. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }


  useEffect(()=>{
    fetchCartData();
  },[]);

   const handleGetCartData = async (id)=>{
      try{
        setLoading(true);
        const res = await axios.get(`${LINKS.API_BASE_URL}/api/customer/getCartQuantities`,{
          withCredentials: true,
          params :{
            shopId : id
          }
        });
        setCart(res.data || {});
      }catch(e){
        console.error("Error fetching cart data:", e);
        setCart({});
      }finally{
        setLoading(false);
      }
    }

  const subtotal = useMemo(() => {
    return cartProducts.reduce(
      (sum, item) => sum + item.price * (cart[item.productId] || 0),
      0
    );
  }, [cartProducts, cart]);

  const totalItems = useMemo(() => {
    return cartProducts.reduce((sum, item) => sum + (cart[item.productId] || 0), 0);
  }, [cartProducts, cart]);

  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount + DELIVERY_FEE;

  const deleteCartItems = async (shopId) => {
    try {
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/customer/deleteCartItems`, null,
        {
          withCredentials: true,
          params: {
            shopId: Number(shopId),
          }
        }
      );
      alert("Cart Cleared!!");
      handleGetCartData(shopId);
    } catch (e) {
      alert(e);
    }
  };

  const addOrDeleteToCart = async (product, cartTask) => {
    setLoading(true);
    try {
      const res = await axios.post(`${LINKS.API_BASE_URL}/api/customer/addOrDeleteToCart`, null,
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
      if (res.data === 'clearCart') {
        const userAccepted = window.confirm("Do you want to clear cart items from other shops?");
        if (userAccepted) {
          deleteCartItems(product.shopId);
        }
      } else {
        handleGetCartData(product.shopId);
      }
    } catch (e) {
      console.error("Error updating cart:", e);
    }finally{
      setLoading(false);
    }
  };

  const removeItem = async (item) => {
    try {
      const currentQty = cart[item.productId] || 0;
      // Batch delete requests instead of sequential API calls
      const deletePromises = Array(currentQty).fill(null).map(() =>
        addOrDeleteToCart(item, 'delete')
      );
      await Promise.all(deletePromises);
      setCartProducts(prev => prev.filter(p => p.productId !== item.productId));
    } catch (e) {
      console.error(e);
    }
  };

  const applyCoupon = () => {
    if (coupon === "NEAR10") setDiscount(0.1);
    else alert("Invalid Coupon");
  };

  return (
    <>
    {/* <NearShopNavBar /> */}

    <div className="my-cart-container">
      {loading && (
        <Loading></Loading>
      )}
      <div className="cart-page">
        {/* =============================
            CART ITEMS
        ============================= */}
        <div className="cart-items">
          <h2>My Cart</h2>

          {cartProducts.length === 0 && (
            <p className="empty-cart">Your cart is empty</p>
          )}

          {cartProducts.map((item) => (
            <div className="cart-item" key={item.productId}>
              <img src={item.imageLink} alt={item.name} loading="lazy"/>

              <div className="cart-info">
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>
                <span className="stock-text">
                  {item.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="cart-qty">
                {cart[item.productId] ? (
                        <>
                          <button onClick={() => addOrDeleteToCart(item, 'delete')}>-</button>
                          <span>{cart[item.productId]}</span>
                          <button onClick={() => addOrDeleteToCart(item, 'add')}>+</button>
                        </>):''}
              </div>

              <div className="cart-total">
                ₹{item.price * (cart[item.productId] || 0)}
              </div>

              <button
                className="remove-btn"
                onClick={() => removeItem(item)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* =============================
            SUMMARY
        ============================= */}
        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>₹{DELIVERY_FEE}</span>
          </div>

          {discount > 0 && (
            <div className="summary-row green">
              <span>Discount</span>
              <span>-₹{discountAmount.toFixed(0)}</span>
            </div>
          )}

          <div className="coupon-box">
            <input
              placeholder="Enter coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button onClick={applyCoupon}>Apply</button>
          </div>

          <hr />

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>

          <button
            className="pay-btn"
            disabled={cartProducts.length === 0}
            onClick={() => placeOrder()}
          >
            Place your order
          </button>
        </div>
      </div>

      {/* =============================
          PAYMENT MODAL
      ============================= */}
      {showPayment && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <h3>Select Payment Method</h3>

            <div className="payment-method">
              <label>
                <input type="radio" name="pay" defaultChecked /> UPI
              </label>
              <label>
                <input type="radio" name="pay" /> Card
              </label>
              <label>
                <input type="radio" name="pay" /> Cash on Delivery
              </label>
            </div>

            <div className="summary-row total" style={{ marginBottom: '18px' }}>
              <span>{totalItems} items</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            <button
              className="confirm-pay"
              onClick={async () => {
                try {
                  setLoading(true);
                  
                  // Get selected payment method
                  const paymentMethodElement = document.querySelector('input[name="pay"]:checked');
                  const paymentMethod = paymentMethodElement?.labels?.[0]?.textContent?.trim() || "UPI";

                  // Call backend to confirm payment
                  const paymentResponse = await axios.post(
                    `${LINKS.API_BASE_URL}/api/customer/confirmPayment`,
                    {
                      totalAmount: Math.round(total),
                      paymentMethod: paymentMethod,
                      orderId: null // Backend will get orderId from session
                    },
                    {
                      withCredentials: true
                    }
                  );

                  if (paymentResponse.data && paymentResponse.data.success) {
                    alert("Payment Successful 🎉");
                    setShowPayment(false);
                    setCartProducts([]);
                    setCart({});
                    setCoupon("");
                    setDiscount(0);
                    setShopId(0);
                    // Refresh cart data
                    setTimeout(() => fetchCartData(), 500);
                  } else {
                    alert("Payment processing failed. Please try again.");
                  }
                } catch (error) {
                  console.error("Payment error:", error);
                  alert(error.response?.data?.message || "Payment failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Pay ₹{total.toFixed(0)}
            </button>

            <button
              className="close-btn"
              onClick={() => setShowPayment(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </>
    
  );
};

export default MyCart;
