import axios from "axios";

const API_REST_DEV_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

const httpClient = axios.create({
  baseURL: API_REST_DEV_URL,
});

httpClient.interceptors.request.use((config) => {
  const usuarioAutenticado = JSON.parse(
    localStorage.getItem("_usuario_logado")
  );

  if (usuarioAutenticado?.token) {
    config.headers.Authorization = `Bearer ${usuarioAutenticado.token}`;
  }

  return config;
});

class ApiService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  get(url) {
    return httpClient.get(`${this.apiUrl}${url}`);
  }

  post(url, objeto) {
    return httpClient.post(`${this.apiUrl}${url}`, objeto);
  }

  put(url, objeto) {
    return httpClient.put(`${this.apiUrl}${url}`, objeto);
  }

  delete(url) {
    return httpClient.delete(`${this.apiUrl}${url}`);
  }
}

export default ApiService;
