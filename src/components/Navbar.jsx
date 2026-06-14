import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">F</span>
          FoodHub
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" className="nav-link" end>
            Restaurants
          </NavLink>

          {hasRole("Customer") && (
            <>
              <NavLink to="/cart" className="nav-link nav-cart">
                Cart
                {itemCount > 0 && (
                  <span className="nav-cart-badge">{itemCount}</span>
                )}
              </NavLink>
              <NavLink to="/my-orders" className="nav-link">
                My Orders
              </NavLink>
            </>
          )}

          {hasRole("Owner") && (
            <NavLink to="/owner" className="nav-link">
              My Restaurants
            </NavLink>
          )}

          {hasRole("Admin") && (
            <NavLink to="/admin" className="nav-link">
              Admin
            </NavLink>
          )}
        </nav>

        {isAuthenticated ? (
          <div className="nav-user">
            <div>
              <span className="nav-user-name">
                {user.firstName} {user.lastName}
              </span>
              <span className="nav-role">{user.roles?.join(", ")}</span>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <NavLink to="/login" className="nav-link">
              Log in
            </NavLink>
            <NavLink to="/register" className="btn btn-sm btn-accent">
              Sign up
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
