import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import * as ordersApi from "../api/orders";

export default function Cart() {
  const { cart, loading, refreshCart, updateItem, removeItem, clear } =
    useCart();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuantity(menuItemId, qty) {
    setError("");
    setBusyId(menuItemId);
    try {
      if (qty <= 0) {
        await removeItem(menuItemId);
      } else {
        await updateItem(menuItemId, qty);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(menuItemId) {
    setError("");
    setBusyId(menuItemId);
    try {
      await removeItem(menuItemId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleClear() {
    setError("");
    try {
      await clear();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckout() {
    setError("");
    setCheckingOut(true);
    try {
      await ordersApi.checkout();
      await refreshCart();
      navigate("/my-orders", { state: { justOrdered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading && !cart) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Your order</span>
          <h1>Cart</h1>
        </div>
        {items.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleClear}>
            Clear cart
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some dishes from a restaurant to get started.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse restaurants
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex-between"
                style={{
                  padding: "16px 20px",
                  borderBottom:
                    idx < items.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "1rem" }}>{item.menuItemName}</h4>
                  <p className="muted" style={{ fontSize: "0.85rem" }}>
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="qty-stepper">
                    <button
                      disabled={busyId === item.menuItemId}
                      onClick={() =>
                        handleQuantity(item.menuItemId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={busyId === item.menuItemId}
                      onClick={() =>
                        handleQuantity(item.menuItemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <div
                    className="menu-item-price"
                    style={{ minWidth: 64, textAlign: "right" }}
                  >
                    ${item.subTotal.toFixed(2)}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={busyId === item.menuItemId}
                    onClick={() => handleRemove(item.menuItemId)}
                    aria-label={`Remove ${item.menuItemName}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad" style={{ marginTop: 20 }}>
            <div className="summary-row total">
              <span>Total</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              disabled={checkingOut}
              onClick={handleCheckout}
            >
              {checkingOut ? "Placing order..." : "Place order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
