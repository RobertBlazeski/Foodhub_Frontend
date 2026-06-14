import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as restaurantsApi from "../api/restaurants";
import * as menuItemsApi from "../api/menuItems";
import * as categoriesApi from "../api/categories";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=FoodHub";

const EMPTY_RESTAURANT = {
  name: "",
  address: "",
  phoneNumber: "",
  description: "",
  imageUrl: "",
};

const EMPTY_MENU_ITEM = {
  name: "",
  description: "",
  price: "",
  isAvailable: true,
  imageUrl: "",
  categoryId: "",
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("restaurants");

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState(EMPTY_RESTAURANT);

  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState(EMPTY_MENU_ITEM);

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([restaurantsApi.getRestaurants(), categoriesApi.getCategories()])
      .then(([rs, cats]) => {
        setRestaurants(rs);
        setCategories(cats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const myRestaurants = useMemo(
    () => restaurants.filter((r) => r.ownerId === user?.id),
    [restaurants, user]
  );

  useEffect(() => {
    if (!selectedRestaurantId && myRestaurants.length > 0) {
      setSelectedRestaurantId(myRestaurants[0].id);
    }
  }, [myRestaurants, selectedRestaurantId]);

  useEffect(() => {
    if (!selectedRestaurantId) {
      setMenuItems([]);
      return;
    }
    menuItemsApi
      .getMenuItemsByRestaurant(selectedRestaurantId)
      .then(setMenuItems)
      .catch((err) => setError(err.message));
  }, [selectedRestaurantId]);

  function flash(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }

  // ----- Restaurants -----
  function openCreateRestaurant() {
    setEditingRestaurant(null);
    setRestaurantForm(EMPTY_RESTAURANT);
    setShowRestaurantForm(true);
  }

  function openEditRestaurant(restaurant) {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name,
      address: restaurant.address,
      phoneNumber: restaurant.phoneNumber,
      description: restaurant.description || "",
      imageUrl: restaurant.imageUrl || "",
    });
    setShowRestaurantForm(true);
  }

  async function submitRestaurant(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...restaurantForm,
      imageUrl: restaurantForm.imageUrl.trim() || PLACEHOLDER_IMAGE,
    };

    try {
      if (editingRestaurant) {
        await restaurantsApi.updateRestaurant(editingRestaurant.id, payload);
        flash("Restaurant updated.");
      } else {
        await restaurantsApi.createRestaurant(payload);
        flash("Restaurant created.");
      }
      setShowRestaurantForm(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // ----- Menu items -----
  function openCreateMenuItem() {
    setEditingMenuItem(null);
    setMenuForm({
      ...EMPTY_MENU_ITEM,
      categoryId: categories[0]?.id ?? "",
    });
    setShowMenuForm(true);
  }

  function openEditMenuItem(item) {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || "",
      categoryId: item.categoryId,
    });
    setShowMenuForm(true);
  }

  async function submitMenuItem(e) {
    e.preventDefault();
    setError("");

    if (!selectedRestaurantId) {
      setError("Create a restaurant first.");
      return;
    }
    if (!menuForm.categoryId) {
      setError("Create a category first (see the Categories tab).");
      return;
    }

    const payload = {
      name: menuForm.name,
      description: menuForm.description,
      price: parseFloat(menuForm.price),
      isAvailable: menuForm.isAvailable,
      imageUrl: menuForm.imageUrl.trim() || PLACEHOLDER_IMAGE,
      restaurantId: selectedRestaurantId,
      categoryId: Number(menuForm.categoryId),
    };

    try {
      if (editingMenuItem) {
        await menuItemsApi.updateMenuItem(editingMenuItem.id, payload);
        flash("Menu item updated.");
      } else {
        await menuItemsApi.createMenuItem(payload);
        flash("Menu item added.");
      }
      setShowMenuForm(false);
      const items = await menuItemsApi.getMenuItemsByRestaurant(
        selectedRestaurantId
      );
      setMenuItems(items);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailability(item) {
    setError("");
    try {
      await menuItemsApi.updateMenuItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: !item.isAvailable,
        imageUrl: item.imageUrl || PLACEHOLDER_IMAGE,
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
      });
      const items = await menuItemsApi.getMenuItemsByRestaurant(
        selectedRestaurantId
      );
      setMenuItems(items);
    } catch (err) {
      setError(err.message);
    }
  }

  // ----- Categories -----
  async function submitCategory(e) {
    e.preventDefault();
    setError("");
    if (!newCategory.trim()) return;

    try {
      await categoriesApi.createCategory({ name: newCategory.trim() });
      setNewCategory("");
      const cats = await categoriesApi.getCategories();
      setCategories(cats);
      flash("Category added.");
    } catch (err) {
      setError(err.message);
    }
  }

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

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
          <span className="eyebrow">Owner tools</span>
          <h1>My Restaurants</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="tabs">
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

      {tab === "restaurants" && (
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <p className="muted">
              {myRestaurants.length} restaurant
              {myRestaurants.length === 1 ? "" : "s"}
            </p>
            <button className="btn btn-primary btn-sm" onClick={openCreateRestaurant}>
              + Add restaurant
            </button>
          </div>

          {showRestaurantForm && (
            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>
                {editingRestaurant ? "Edit restaurant" : "New restaurant"}
              </h3>
              <form className="form" onSubmit={submitRestaurant}>
                <div className="form-row">
                  <div className="field">
                    <label>Name</label>
                    <input
                      required
                      maxLength={100}
                      value={restaurantForm.name}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Phone number</label>
                    <input
                      required
                      value={restaurantForm.phoneNumber}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          phoneNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Address</label>
                  <input
                    required
                    maxLength={200}
                    value={restaurantForm.address}
                    onChange={(e) =>
                      setRestaurantForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    maxLength={500}
                    value={restaurantForm.description}
                    onChange={(e) =>
                      setRestaurantForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Image URL</label>
                  <input
                    placeholder="https://..."
                    value={restaurantForm.imageUrl}
                    onChange={(e) =>
                      setRestaurantForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                  />
                  <span className="field-hint">
                    Leave blank to use a placeholder image.
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary">
                    {editingRestaurant ? "Save changes" : "Create restaurant"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowRestaurantForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {myRestaurants.length === 0 ? (
            <div className="empty-state">
              <h3>No restaurants yet</h3>
              <p>Add your first restaurant to start building a menu.</p>
            </div>
          ) : (
            <div className="grid">
              {myRestaurants.map((r) => (
                <div className="card" key={r.id}>
                  <div className="restaurant-card-media">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} />
                    ) : (
                      <span>{r.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="restaurant-card-body">
                    <h3>{r.name}</h3>
                    <p className="muted">{r.address}</p>
                    <div className="restaurant-card-meta">
                      <span className="rating">★ {r.rating?.toFixed(1) ?? "—"}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditRestaurant(r)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "menu" && (
        <div>
          {myRestaurants.length === 0 ? (
            <div className="empty-state">
              <h3>Add a restaurant first</h3>
              <p>You need at least one restaurant before adding menu items.</p>
            </div>
          ) : (
            <>
              <div className="flex-between" style={{ marginBottom: 16, flexWrap: "wrap" }}>
                <div className="field" style={{ minWidth: 220 }}>
                  <label>Restaurant</label>
                  <select
                    value={selectedRestaurantId || ""}
                    onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
                  >
                    {myRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openCreateMenuItem}>
                  + Add menu item
                </button>
              </div>

              {showMenuForm && (
                <div className="card card-pad" style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 16 }}>
                    {editingMenuItem ? "Edit menu item" : "New menu item"}
                  </h3>
                  {categories.length === 0 ? (
                    <p className="muted">
                      No categories exist yet. Add one in the Categories tab first.
                    </p>
                  ) : (
                    <form className="form" onSubmit={submitMenuItem}>
                      <div className="form-row">
                        <div className="field">
                          <label>Name</label>
                          <input
                            required
                            maxLength={100}
                            value={menuForm.name}
                            onChange={(e) =>
                              setMenuForm((f) => ({ ...f, name: e.target.value }))
                            }
                          />
                        </div>
                        <div className="field">
                          <label>Price ($)</label>
                          <input
                            required
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="10000"
                            value={menuForm.price}
                            onChange={(e) =>
                              setMenuForm((f) => ({ ...f, price: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label>Description</label>
                        <textarea
                          maxLength={500}
                          value={menuForm.description}
                          onChange={(e) =>
                            setMenuForm((f) => ({ ...f, description: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <div className="field">
                          <label>Category</label>
                          <select
                            value={menuForm.categoryId}
                            onChange={(e) =>
                              setMenuForm((f) => ({ ...f, categoryId: e.target.value }))
                            }
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Image URL</label>
                          <input
                            placeholder="https://..."
                            value={menuForm.imageUrl}
                            onChange={(e) =>
                              setMenuForm((f) => ({ ...f, imageUrl: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="checkbox-row">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          checked={menuForm.isAvailable}
                          onChange={(e) =>
                            setMenuForm((f) => ({
                              ...f,
                              isAvailable: e.target.checked,
                            }))
                          }
                        />
                        <label htmlFor="isAvailable" style={{ margin: 0 }}>
                          Available for ordering
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary">
                          {editingMenuItem ? "Save changes" : "Add item"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setShowMenuForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {menuItems.length === 0 ? (
                <div className="empty-state">
                  <h3>No menu items yet</h3>
                  <p>Add your first dish for this restaurant.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
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
                          <td>{categoryMap.get(item.categoryId) || "—"}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.isAvailable
                                  ? "badge-delivered"
                                  : "badge-cancelled"
                              }`}
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openEditMenuItem(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => toggleAvailability(item)}
                              >
                                {item.isAvailable ? "Mark unavailable" : "Mark available"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div>
          <div className="card card-pad" style={{ marginBottom: 20, maxWidth: 420 }}>
            <h3 style={{ marginBottom: 12 }}>Add category</h3>
            <form className="form" onSubmit={submitCategory} style={{ flexDirection: "row" }}>
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
              <p>Categories help organize menu items, e.g. Pizza, Drinks, Desserts.</p>
            </div>
          ) : (
            <div className="category-pills">
              {categories.map((c) => (
                <span className="pill" key={c.id}>
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
