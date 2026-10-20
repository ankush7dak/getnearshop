import { useMemo, useState } from "react";
import "./ShopkeeperLowStock.css";
import {
  FaSearch,
  FaTruckLoading,
  FaFileExport,
  FaCheckCircle,
} from "react-icons/fa";
import ShopkeeperTopNav from "../ShopkeeperTopNav/ShopkeeperTopNav";

const LOW_STOCK_DATA = [
  {
    id: 1,
    name: "Basmati Rice",
    sku: "GR-201",
    category: "Grocery",
    stock: 4,
    threshold: 10,
    supplier: "Sharma Foods",
    lastRestock: "2026-01-25",
    velocity: 2.5,
    reorderPlaced: false,
  },
  {
    id: 2,
    name: "Paracetamol",
    sku: "MD-110",
    category: "Medical",
    stock: 0,
    threshold: 15,
    supplier: "HealthCorp",
    lastRestock: "2026-01-20",
    velocity: 4,
    reorderPlaced: true,
  },
];

export default function ShopkeeperLowStock() {
  const [items, setItems] = useState(LOW_STOCK_DATA);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [sort, setSort] = useState("urgency");
  const [selected, setSelected] = useState([]);

  const categories = ["ALL", ...new Set(items.map(i => i.category))];
  const suppliers = ["ALL", ...new Set(items.map(i => i.supplier))];

  const processed = useMemo(() => {
    let data = [...items];

    if (search)
      data = data.filter(
        i =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.sku.toLowerCase().includes(search.toLowerCase())
      );

    if (category !== "ALL")
      data = data.filter(i => i.category === category);

    if (supplier !== "ALL")
      data = data.filter(i => i.supplier === supplier);

    if (sort === "urgency")
      data.sort(
        (a, b) =>
          a.stock / a.threshold - b.stock / b.threshold
      );

    return data;
  }, [items, search, category, supplier, sort]);

  const toggleReorder = id => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, reorderPlaced: !i.reorderPlaced }
          : i
      )
    );
  };

  const bulkReorder = () => {
    setItems(prev =>
      prev.map(i =>
        selected.includes(i.id)
          ? { ...i, reorderPlaced: true }
          : i
      )
    );
    setSelected([]);
  };

  return (
    <><ShopkeeperTopNav></ShopkeeperTopNav>
    <div className="lowstock-page">

      <header className="lowstock-header">
        <h2>🚨 Low Stock Alert Center</h2>

        {selected.length > 0 && (
          <div className="bulk-panel">
            <span>{selected.length} selected</span>
            <button onClick={bulkReorder}>
              <FaTruckLoading /> Bulk Reorder
            </button>
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="lowstock-toolbar">

        <div className="search">
          <FaSearch />
          <input
            placeholder="Search name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={supplier} onChange={e => setSupplier(e.target.value)}>
          {suppliers.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="urgency">Most Urgent</option>
          <option value="stock">Lowest Stock</option>
        </select>

        <button className="export">
          <FaFileExport /> Export
        </button>
      </div>

      {/* Desktop Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Days Left</th>
              <th>Status</th>
              <th>Reorder</th>
            </tr>
          </thead>

          <tbody>
            {processed.map(i => {
              const daysLeft =
                i.velocity > 0
                  ? Math.ceil(i.stock / i.velocity)
                  : "∞";

              return (
                <tr
                  key={i.id}
                  className={i.stock === 0 ? "out-row" : "low-row"}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(i.id)}
                      onChange={() =>
                        setSelected(prev =>
                          prev.includes(i.id)
                            ? prev.filter(x => x !== i.id)
                            : [...prev, i.id]
                        )
                      }
                    />
                  </td>

                  <td>{i.name}</td>
                  <td>{i.sku}</td>
                  <td>{i.supplier}</td>

                  <td className="danger">{i.stock}</td>
                  <td>{i.threshold}</td>

                  <td>{daysLeft} days</td>

                  <td>
                    {i.reorderPlaced ? (
                      <span className="badge done">
                        <FaCheckCircle /> Ordered
                      </span>
                    ) : (
                      <span className="badge urgent">Pending</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="reorder-btn"
                      onClick={() => toggleReorder(i.id)}
                    >
                      {i.reorderPlaced ? "Undo" : "Reorder"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-grid">
        {processed.map(i => (
          <div className="mobile-card" key={i.id}>
            <h4>{i.name}</h4>
            <p>{i.sku}</p>
            <p>Supplier: {i.supplier}</p>

            <p>
              Stock:
              <span className="danger">{i.stock}</span>
            </p>

            <p>Days Left: {Math.ceil(i.stock / i.velocity)}</p>

            <button onClick={() => toggleReorder(i.id)}>
              {i.reorderPlaced ? "Undo Reorder" : "Place Reorder"}
            </button>
          </div>
        ))}
      </div>

    </div>
    </>
  );
}
