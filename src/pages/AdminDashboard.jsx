import { useEffect, useMemo, useState } from "react";
import * as restaurantsApi from "../api/restaurants";
import * as categoriesApi from "../api/categories";
import * as menuItemsApi from "../api/menuItems";
import * as ordersApi from "../api/orders";
import StatusBadge from "../components/StatusBadge";

const ORDER_STATUSES = ["Pending", "Preparing", "Delivered", "Cancelled"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders");

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function flash(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }

  function loadAll() {
    setLoading(true);
    Promise.all([
      restaurantsApi.getRestaurants(),
      categoriesApi.getCategories(),
      menuItemsApi.getMenuItems(),
      ordersApi.getAllOrders(),
    ])
      .then(([rs, cats, items, ords]) => {
        setRestaurants(rs);
        setCategories(cats);
        setMenuItems(items);
        setOrders(
          [...ords].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const restaurantMap = useMemo(() => {
    const map = new Map();
    restaurants.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [restaurants]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // ----- Restaurants -----
  async function handleDeleteRestaurant(id) {
    if (!confirm("Delete this restaurant? This cannot be undone.")) return;
    setError("");
    try {
      await restaurantsApi.deleteRestaurant(id);
      flash("Restaurant deleted.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // ----- Categories -----
  async function submitNewCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setError("");
    try {
      await categoriesApi.createCategory({ name: newCategory.trim() });
      setNewCategory("");
      flash("Category added.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditCategory(cat) {
    setEditingCategory(cat.id);
    setCategoryName(cat.name);
  }

  async function saveCategory(id) {
    setError("");
    try {
      await categoriesApi.updateCategory(id, { name: categoryName });
      setEditingCategory(null);
      flash("Category updated.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    setError("");
    try {
      await categoriesApi.deleteCategory(id);
      flash("Category deleted.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // ----- Menu items -----
  async function handleDeleteMenuItem(id) {
    if (!confirm("Delete this menu item?")) return;
    setError("");
    try {
      await menuItemsApi.deleteMenuItem(id);
      flash("Menu item deleted.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // ----- Orders -----
  async function handleStatusChange(orderId, status) {
    setError("");
    try {
      await ordersApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      flash(`Order #${orderId} marked ${status}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Platform admin</span>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="tabs">
        <button
          className={`tab ${tab === "orders" ? "active" : ""}`}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
        <button
          className={`tab ${tab === "restaurants" ? "active" : ""}`}
          onClick={() => setTab("restaurants")}
        >
          Restaurants
        </button>
        <button
          className={`tab ${tab === "menu" ? "active" : ""}`}
          onClick={() => setTab("menu")}
        >
          Menu Items
        </button>
        <button
          className={`tab ${tab === "categories" ? "active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
      </div>

      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>Orders placed by customers will appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.orderDate).toLocaleString()}</td>
                      <td>
                        {order.items
                          .map((i) => `${i.quantity}× ${i.menuItemName}`)
                          .join(", ")}
                      </td>
                      <td>${order.totalPrice.toFixed(2)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "restaurants" && (
        <>
          {restaurants.length === 0 ? (
            <div className="empty-state">
              <h3>No restaurants yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Rating</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.address}</td>
                      <td>{r.ownerName}</td>
                      <td>★ {r.rating?.toFixed(1) ?? "—"}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteRestaurant(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "menu" && (
        <>
          {menuItems.length === 0 ? (
            <div className="empty-state">
              <h3>No menu items yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Restaurant</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{restaurantMap.get(item.restaurantId) || "—"}</td>
                      <td>{categoryMap.get(item.categoryId) || "—"}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.isAvailable ? "badge-delivered" : "badge-cancelled"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteMenuItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "categories" && (
        <div>
          <div className="card card-pad" style={{ marginBottom: 20, maxWidth: 420 }}>
            <h3 style={{ marginBottom: 12 }}>Add category</h3>
            <form
              className="form"
              onSubmit={submitNewCategory}
              style={{ flexDirection: "row" }}
            >
              <input
                placeholder="e.g. Desserts"
                maxLength={50}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button className="btn btn-primary">Add</button>
            </form>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state">
              <h3>No categories yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {editingCategory === c.id ? (
                          <input
                            value={categoryName}
                            maxLength={50}
                            onChange={(e) => setCategoryName(e.target.value)}
                            style={{ maxWidth: 220 }}
                          />
                        ) : (
                          c.name
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          {editingCategory === c.id ? (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => saveCategory(c.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingCategory(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => startEditCategory(c)}
                              >
                                Rename
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteCategory(c.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
