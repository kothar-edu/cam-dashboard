import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_URL}api`;
const token = localStorage.getItem("token");

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default axios;
