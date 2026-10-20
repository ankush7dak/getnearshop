import { useCallback, useEffect, useRef, useState } from "react";
import "./CategoryScroller.css";

const dummyCategories = [
  { id: 1, name: "Grocery", icon: "🛒" },
  { id: 2, name: "Vegetables", icon: "🥦" },
  { id: 3, name: "Fruits", icon: "🍎" },
  { id: 4, name: "Bakery", icon: "🥖" },
  { id: 5, name: "Pharmacy", icon: "💊" },
  { id: 6, name: "Electronics", icon: "📱" },
  { id: 7, name: "Fashion", icon: "👕" },
  { id: 8, name: "Stationery", icon: "📚" },
  { id: 9, name: "Meat", icon: "🍗" },
  { id: 10, name: "Dairy", icon: "🥛" },
  { id: 11, name: "Dairy", icon: "🥛" },
  { id: 12, name: "Stationery", icon: "📚" },
  { id: 13, name: "Meat", icon: "🍗" },
  { id: 14, name: "Dairy", icon: "🥛" },
  { id: 15, name: "Dairy", icon: "🥛" },

];

export default function CategoryScroller({ data }) {
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeft(el.scrollLeft > 5);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();

    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollLeftHandler = () => {
    scrollRef.current?.scrollBy({
      left: -100,
      behavior: "smooth",
    });
  };

  const scrollRightHandler = () => {
    scrollRef.current?.scrollBy({
      left: 100,
      behavior: "smooth",
    });
  };

  return (
    <div className="nearshop-category-outer">
      {data && <div className="nearshop-category-wrapper">
        {showLeft && (
          <button
            className="scroll-btn left"
            onClick={scrollLeftHandler}
            aria-label="Scroll categories left"
          >
            ◀
          </button>
        )}

        <div className="nearshop-category-list" ref={scrollRef}>
          {dummyCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${activeId === cat.id ? "active" : ""
                }`}
              onClick={() => {
                setActiveId(cat.id);
                onSelectCategory?.(cat);
              }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
            </button>
          ))}
        </div>

        {showRight && (
          <button
            className="scroll-btn right"
            onClick={scrollRightHandler}
            aria-label="Scroll categories right"
          >
            ▶
          </button>
        )}
      </div>}
    </div>
  );
}
