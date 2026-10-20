import { useEffect, useState } from "react";
import "./VisitedShops.css";
import {
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaDirections,
  FaRedo,
  FaFilter,
} from "react-icons/fa";

const MOCK_VISITS = [
  {
    id: 1,
    name: "Fresh Mart",
    category: "Grocery",
    rating: 4.4,
    distance: 1.2,
    lastVisited: "2026-02-05",
    isOpen: true,
    isFavorite: true,
    image:
      "https://images.unsplash.com/photo-1580910051074-7f1e2e6b9c3d?q=80&w=800",
  },
  {
    id: 2,
    name: "HealthPlus Pharmacy",
    category: "Pharmacy",
    rating: 4.1,
    distance: 2.6,
    lastVisited: "2026-02-01",
    isOpen: false,
    isFavorite: false,
    image:
      "https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=800",
  },
];

export default function VisitedShops() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShops(MOCK_VISITS);
      setLoading(false);
    }, 1000);
  }, []);

  const filtered = shops
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((s) => (category === "all" ? true : s.category === category))
    .sort((a, b) => {
      if (sort === "recent")
        return new Date(b.lastVisited) - new Date(a.lastVisited);
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "distance") return a.distance - b.distance;
      return 0;
    });

  return (
    <div className="visited-shop-container">
        <div className="visited-container">
      {/* Header */}
      <div className="visited-header">
        <h2>Visited Shops</h2>
        <p>Quickly revisit stores you explored or ordered from</p>
      </div>

      {/* Search & Filters */}
      <div className="visited-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            placeholder="Search shop name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Grocery">Grocery</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Electronics">Electronics</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Recently Visited</option>
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest</option>
          </select>

          <button className="filter-btn">
            <FaFilter /> More
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="shop-grid">
          {[1, 2, 3, 4].map((i) => (
            <div className="shop-skeleton" key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No visited shops found</h3>
          <p>Start exploring nearby stores to see them here.</p>
        </div>
      ) : (
        <div className="shop-grid">
          {filtered.map((shop) => (
            <div className="shop-card" key={shop.id}>
              <div className="image-wrap">
                <img src={shop.image} alt={shop.name} />
                <span
                  className={`status ${shop.isOpen ? "open" : "closed"}`}
                >
                  {shop.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <div className="shop-info">
                <div className="title-row">
                  <h4>{shop.name}</h4>
                  <button
                    className="fav-btn"
                    onClick={() =>
                      setShops((prev) =>
                        prev.map((s) =>
                          s.id === shop.id
                            ? { ...s, isFavorite: !s.isFavorite }
                            : s
                        )
                      )
                    }
                  >
                    {shop.isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>

                <p className="category">{shop.category}</p>

                <div className="meta">
                  ⭐ {shop.rating} • {shop.distance} km
                </div>

                <p className="last-visited">
                  Last visited: {shop.lastVisited}
                </p>

                <div className="actions">
                  <button className="primary">
                    <FaRedo /> Reorder
                  </button>
                  <button className="secondary">
                    <FaDirections /> Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
