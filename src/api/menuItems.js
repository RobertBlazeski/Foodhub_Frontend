import client from "./client";

export function getMenuItems() {
  return client.get("/MenuItem").then((res) => res.data);
}

export function getMenuItem(id) {
  return client.get(`/MenuItem/${id}`).then((res) => res.data);
}

export function getMenuItemsByRestaurant(restaurantId) {
  return client
    .get(`/MenuItem/restaurant/${restaurantId}`)
    .then((res) => res.data);
}

export function createMenuItem(dto) {
  return client.post("/MenuItem", dto).then((res) => res.data);
}

export function updateMenuItem(id, dto) {
  return client.put(`/MenuItem/${id}`, dto).then((res) => res.data);
}

export function deleteMenuItem(id) {
  return client.delete(`/MenuItem/${id}`);
}
