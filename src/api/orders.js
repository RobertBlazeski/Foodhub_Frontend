import client from "./client";

export function getAllOrders() {
  return client.get("/Order").then((res) => res.data);
}

export function getOrder(id) {
  return client.get(`/Order/${id}`).then((res) => res.data);
}

export function getMyOrders() {
  return client.get("/Order/my-orders").then((res) => res.data);
}

export function checkout() {
  return client.post("/Order/checkout").then((res) => res.data);
}

export function updateOrderStatus(id, status) {
  return client.put(`/Order/${id}/status`, { status }).then((res) => res.data);
}

export function cancelOrder(id) {
  return client.put(`/Order/${id}/cancel`).then((res) => res.data);
}
