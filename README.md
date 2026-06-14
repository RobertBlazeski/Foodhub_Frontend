# FoodHub Frontend

A React (Vite) frontend for the FoodHub Food Ordering System API.

## Stack

- React 19 + Vite
- React Router for navigation
- Axios for API calls
- Plain CSS (design tokens in `src/index.css`)

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Check `.env` — it should point at your local API:

   ```
   VITE_API_URL=https://localhost:7252/api
   ```

   Adjust the port if your backend runs on a different one (check the
   "Now listening on" line when you run `dotnet run`).

3. Make sure the backend has CORS enabled for `http://localhost:5173`
   (the Vite dev server's default port). See the backend setup notes.

4. Start the dev server:

   ```
   npm run dev
   ```

   Then open the printed URL (usually `http://localhost:5173`).

## Roles

When you register, choose:

- **Customer** — browse restaurants, build a cart, place and track orders.
- **Owner** — create and manage your own restaurants and their menus, and
  add categories.

There's no "Admin" option on the signup form (by design — admins shouldn't
be self-service). To get an Admin account, either:

- manually update a user's role in the database (in the `AspNetUserRoles`
  table), or
- ask the backend team to add an admin-seeding step.

Once a user has the `Admin` role (and logs in again so the JWT includes
it), the **Admin** nav link and dashboard become available — global
restaurant/category/menu-item management and order status updates.

## Project structure

```
src/
  api/         one module per backend controller (auth, restaurants, ...)
  context/     AuthContext (JWT + user) and CartContext (cart state)
  components/  Navbar, RestaurantCard, StatusBadge, ProtectedRoute
  pages/       Home, RestaurantDetail, Login, Register, Cart, MyOrders,
               OwnerDashboard, AdminDashboard, NotFound
```

## Notes

- Image URLs: the backend validates `ImageUrl` fields as proper URLs, so
  the forms fall back to a placeholder image if left blank.
- The JWT is stored in `localStorage` and attached to every API request
  automatically via an Axios interceptor.
