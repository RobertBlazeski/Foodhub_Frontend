import client from "./client";

export function getCategories() {
  return client.get("/Category").then((res) => res.data);
}

export function getCategory(id) {
  return client.get(`/Category/${id}`).then((res) => res.data);
}

export function createCategory(dto) {
  return client.post("/Category", dto).then((res) => res.data);
}

export function updateCategory(id, dto) {
  return client.put(`/Category/${id}`, dto).then((res) => res.data);
}

export function deleteCategory(id) {
  return client.delete(`/Category/${id}`);
}
