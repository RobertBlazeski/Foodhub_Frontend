import { useEffect, useMemo, useState } from "react";
import { getRestaurants } from "../api/restaurants";
import RestaurantCard from "../components/RestaurantCard";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    getRestaurants()
      .then((data) => {
        if (active) setRestaurants(data);
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
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term)
    );
  }, [restaurants, search]);

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Hungry?</span>
          <h1>Restaurants near you</h1>
        </div>
        <input
          style={{ maxWidth: 260 }}
          placeholder="Search by name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No restaurants found</h3>
          <p>Try a different search, or check back later.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
