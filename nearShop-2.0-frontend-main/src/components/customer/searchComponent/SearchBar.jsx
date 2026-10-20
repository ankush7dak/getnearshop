import React, { useEffect, useRef, useState, useMemo } from "react";
import "./SearchBar.css";

const MOCK_DATA = [
  { id: 1, name: "Fresh Mart", type: "Shop" },
  { id: 2, name: "Milk 1L", type: "Product" },
  { id: 3, name: "Rice Bag", type: "Product" },
  { id: 4, name: "Veg Bazaar", type: "Shop" },
  { id: 5, name: "Egg Tray", type: "Product" },
  { id: 6, name: "Daily Needs", type: "Shop" }
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  /* Close when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Debounce search */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setActiveIndex(-1);

    const timer = setTimeout(() => {
      const filtered = MOCK_DATA.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered);
      setOpen(true);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const groupedResults = useMemo(() => {
    return results.reduce((acc, cur) => {
      acc[cur.type] = acc[cur.type] || [];
      acc[cur.type].push(cur);
      return acc;
    }, {});
  }, [results]);

  const flatResults = useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  const handleKeyDown = (e) => {
    if (!open || flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < flatResults.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : flatResults.length - 1
      );
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      setQuery(flatResults[activeIndex].name);
      setOpen(false);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const highlightMatch = (text) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "ig");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="global-search-wrapper" ref={wrapperRef}>
      <div className="global-search-bar">
        <span className="search-icon">🔍</span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands or shops"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-panel"
        />

        {query && (
          <button
            className="clear-btn"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div id="search-panel" className="search-panel">
          {loading && <div className="loader">Searching…</div>}

          {!loading && flatResults.length === 0 && query && (
            <div className="empty">No results found</div>
          )}

          {!loading &&
            Object.entries(groupedResults).map(([type, items]) => (
              <div key={type} className="result-group">
                <div className="group-title">{type}</div>

                {items.map((item) => {
                  const globalIndex = flatResults.findIndex(
                    (r) => r.id === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`search-item ${
                        activeIndex === globalIndex ? "active" : ""
                      }`}
                      onMouseEnter={() =>
                        setActiveIndex(globalIndex)
                      }
                      onClick={() => {
                        setQuery(item.name);
                        setOpen(false);
                      }}
                    >
                      <span>
                        {highlightMatch(item.name)}
                      </span>
                      <small>{item.type}</small>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
