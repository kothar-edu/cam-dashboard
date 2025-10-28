import axios from "axios";

const BASE_URL = `https://devapi.cam-youth.com/api`;
const token = localStorage.getItem("token");
console.log(token);

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default axios;
