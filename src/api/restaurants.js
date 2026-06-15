import client from "./client";

export function getRestaurants() {
  return client.get("/Restaurant").then((res) => res.data);
}

export function getRestaurant(id) {
  return client.get(`/Restaurant/${id}`).then((res) => res.data);
}

export function createRestaurant(dto) {
  return client.post("/Restaurant", dto).then((res) => res.data);
}

export function updateRestaurant(id, dto) {
  return client.put(`/Restaurant/${id}`, dto).then((res) => res.data);
}

export function deleteRestaurant(id) {
  return client.delete(`/Restaurant/${id}`)
}
