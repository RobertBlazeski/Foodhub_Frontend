import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as ordersApi from "../api/orders";
import StatusBadge from "../components/StatusBadge";

export default function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    ordersApi
      .getMyOrders()
      .then((data) =>
        setOrders(
          [...data].sort(
            (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
          )
        )
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id) {
    setError("");
    setBusyId(id);
    try {
      await ordersApi.cancelOrder(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Order history</span>
          <h1>My Orders</h1>
        </div>
      </div>

      {location.state?.justOrdered && (
        <div className="alert alert-success">
          Your order has been placed! You can track its status here.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Once you place an order, it'll show up here.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="ticket" key={order.id}>
            <div className="ticket-main">
              <div className="ticket-header">
                <span className="ticket-id">ORDER #{order.id}</span>
                <span className="ticket-date">
                  {new Date(order.orderDate).toLocaleString()}
                </span>
              </div>
              <StatusBadge status={order.status} />
              <div className="ticket-items">
                {order.items.map((item, idx) => (
                  <div className="ticket-line" key={idx}>
                    <span>
                      <span className="qty">{item.quantity}×</span>
                      {item.menuItemName}
                    </span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ticket-stub">
              <div>
                <div className="ticket-total-label">Total</div>
                <div className="ticket-total">
                  ${order.totalPrice.toFixed(2)}
                </div>
              </div>
              {order.status === "Pending" && (
                <button
                  className="btn btn-danger btn-sm"
                  disabled={busyId === order.id}
                  onClick={() => handleCancel(order.id)}
                >
                  Cancel order
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
