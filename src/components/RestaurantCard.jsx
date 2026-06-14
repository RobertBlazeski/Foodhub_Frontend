import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  const initial = restaurant.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-card-media">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="restaurant-card-body">
        <h3>{restaurant.name}</h3>
        <p className="muted">{restaurant.address}</p>
        <div className="restaurant-card-meta">
          <span className="rating">★ {restaurant.rating?.toFixed(1) ?? "—"}</span>
          <span>{restaurant.phoneNumber}</span>
        </div>
      </div>
    </Link>
  );
}
