import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurant } from "../api/restaurants";
import { getMenuItemsByRestaurant } from "../api/menuItems";
import { getCategories } from "../api/categories";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const { hasRole, isAuthenticated } = useAuth();
  const { cart, addItem, updateItem, removeItem } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      getRestaurant(id),
      getMenuItemsByRestaurant(id),
      getCategories(),
    ])
      .then(([restaurantData, items, cats]) => {
        if (!active) return;
        setRestaurant(restaurantData);
        setMenuItems(items);
        setCategories(cats);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const categoriesInMenu = useMemo(() => {
    const ids = new Set(menuItems.map((m) => m.categoryId));
    return categories.filter((c) => ids.has(c.id));
  }, [categories, menuItems]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return menuItems;
    return menuItems.filter((m) => m.categoryId === activeCategory);
  }, [menuItems, activeCategory]);

  const groupedItems = useMemo(() => {
    const groups = new Map();
    visibleItems.forEach((item) => {
      const key = item.categoryId;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return groups;
  }, [visibleItems]);

  function cartQuantity(menuItemId) {
    const line = cart?.items?.find((i) => i.menuItemId === menuItemId);
    return line?.quantity || 0;
  }

  async function handleAdd(menuItemId) {
    setError("");
    setPendingId(menuItemId);
    try {
      await addItem(menuItemId, 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  async function handleQuantityChange(menuItemId, nextQty) {
    setError("");
    setPendingId(menuItemId);
    try {
      if (nextQty <= 0) {
        await removeItem(menuItemId);
      } else {
        await updateItem(menuItemId, nextQty);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Restaurant not found</h3>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 12 }}>
            Back to restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="restaurant-hero">
        <div>
          <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
            {restaurant.address}
          </span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description || "No description provided yet."}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="rating" style={{ fontSize: "1.1rem" }}>
            ★ {restaurant.rating?.toFixed(1) ?? "—"}
          </div>
          <p style={{ marginTop: 8 }}>{restaurant.phoneNumber}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!isAuthenticated && (
        <div className="alert alert-success">
          <Link to="/login">Log in</Link> as a customer to add items to your
          cart.
        </div>
      )}

      {categoriesInMenu.length > 1 && (
        <div className="category-pills">
          <button
            className={`pill ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {categoriesInMenu.map((cat) => (
            <button
              key={cat.id}
              className={`pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {menuItems.length === 0 ? (
        <div className="empty-state">
          <h3>No menu items yet</h3>
          <p>This restaurant hasn't added any dishes.</p>
        </div>
      ) : (
        Array.from(groupedItems.entries()).map(([categoryId, items]) => (
          <div key={categoryId}>
            <div className="menu-section-title">
              {categoryMap.get(categoryId) || "Other"}
            </div>
            <div className="stack">
              {items.map((item) => {
                const qty = cartQuantity(item.id);
                const isPending = pendingId === item.id;

                return (
                  <div className="menu-item" key={item.id}>
                    <div className="menu-item-media">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <span>{item.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="menu-item-body">
                      <h4>{item.name}</h4>
                      {item.description && (
                        <p className="menu-item-desc">{item.description}</p>
                      )}
                      <div className="menu-item-price">
                        ${item.price.toFixed(2)}
                      </div>
                      {!item.isAvailable && (
                        <span
                          className="badge badge-cancelled"
                          style={{ marginTop: 6 }}
                        >
                          Unavailable
                        </span>
                      )}
                    </div>

                    {hasRole("Customer") && item.isAvailable && (
                      <div className="menu-item-actions">
                        {qty === 0 ? (
                          <button
                            className="btn btn-accent btn-sm"
                            disabled={isPending}
                            onClick={() => handleAdd(item.id)}
                          >
                            Add
                          </button>
                        ) : (
                          <div className="qty-stepper">
                            <button
                              disabled={isPending}
                              onClick={() =>
                                handleQuantityChange(item.id, qty - 1)
                              }
                            >
                              −
                            </button>
                            <span>{qty}</span>
                            <button
                              disabled={isPending}
                              onClick={() =>
                                handleQuantityChange(item.id, qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
