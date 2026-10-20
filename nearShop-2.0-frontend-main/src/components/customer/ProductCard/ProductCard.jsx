import React, { useState } from "react";
import "./ProductCard.css";
import fallbackImage from "../../../assets/image-not-found.png";

const ProductCard = ({ product, onAddToCart, onUpdateQty }) => {
  const {
    name = "Unnamed Product",
    image,
    price = 0,
    oldPrice,
    rating = 0,
    stock = 0,
  } = product || {};

  const [quantity, setQuantity] = useState(0);

  const safeRating = Math.min(5, Math.max(0, rating));
  const inStock = stock > 0;

  const handleAdd = () => {
    setQuantity(1);
    onAddToCart?.(product);
  };

  const increaseQty = () => {
    if (quantity < stock) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      onUpdateQty?.(product, newQty);
    }
  };

  const decreaseQty = () => {
    const newQty = quantity - 1;
    setQuantity(newQty);
    onUpdateQty?.(product, newQty);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={image || fallbackImage}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
          className="product-img"
        />

        <span className={`stock-badge ${inStock ? "in" : "out"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="product-info">
        <h3 className="product-name">{name}</h3>

        <div className="product-price">
          <span className="current-price">₹{price}</span>
          {oldPrice && <span className="old-price">₹{oldPrice}</span>}
        </div>

        <div className="product-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < safeRating ? "star filled" : "star"}
            >
              ★
            </span>
          ))}
        </div>

        {/* ACTION AREA */}
        <div className="cart-action">
          {quantity === 0 ? (
            <button
              className="add-cart-btn"
              disabled={!inStock}
              onClick={handleAdd}
            >
              Add to Cart
            </button>
          ) : (
            <div className="qty-controller">
              <button onClick={decreaseQty}>−</button>
              <span>{quantity}</span>
              <button onClick={increaseQty} disabled={quantity === stock}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
