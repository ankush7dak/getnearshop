import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import sampleImg from "../../../assets/sample-image.jpg";

import "./ProductCardContainer.css";

const products = [
  {
    id: 1,
    name: "Organic Apples (1kg)",
    image: sampleImg,
    price: 120,
    oldPrice: 150,
    rating: 4,
    stock: 18,
  },
  {
    id: 2,
    name: "Fresh Cow Milk 1L",
    image: sampleImg,
    price: 60,
    rating: 5,
    stock: 0, // OUT OF STOCK
  },
  {
    id: 3,
    name: "Whole Wheat Bread",
    image: sampleImg,
    price: 40,
    oldPrice: 50,
    rating: 4,
    stock: 12,
  },
  {
    id: 4,
    name: "Fresh Bananas (12 pcs)",
    image: "/images/banana.jpg",
    price: 50,
    rating: 5,
    stock: 30,
  },
  {
    id: 5,
    name: "Orange Juice 1L",
    image: "/images/juice.jpg",
    price: 80,
    oldPrice: 100,
    rating: 3,
    stock: 7,
  },
];


const ProductCardContainer = ({data}) => {
  if (!products || products.length === 0) {
    return <p className="no-products">No products available.</p>;
  }

  return (
    <div className="card-container">
      {data && <div className="product-card-container">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>}
    </div>

  );
};

export default ProductCardContainer;
