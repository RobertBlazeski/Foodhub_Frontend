import client from "./client";

export function getCart() {
  return client.get("/Cart").then((res) => res.data);
}

export function addToCart(menuItemId, quantity) {
  return client
    .post("/Cart/items", { menuItemId, quantity })
    .then((res) => res.data);
}

export function updateCartItem(menuItemId, quantity) {
  return client
    .put(`/Cart/items/${menuItemId}`, { quantity })
    .then((res) => res.data);
}

export function removeCartItem(menuItemId) {
  return client.delete(`/Cart/items/${menuItemId}`).then((res) => res.data);
}

export function clearCart() {
  return client.delete("/Cart").then((res) => res.data);
}
