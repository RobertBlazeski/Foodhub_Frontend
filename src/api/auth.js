import client from "./client";

export function login(email, password) {
  return client
    .post("/Auth/login", { email, password })
    .then((res) => res.data);
}

export function register({ firstName, lastName, email, password, role }) {
  return client
    .post("/Auth/register", {
      firstName,
      lastName,
      email,
      password,
      role,
    })
    .then((res) => res.data);
}
