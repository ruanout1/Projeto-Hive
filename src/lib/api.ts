// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // backend rodará nesta porta
});

export default api;
