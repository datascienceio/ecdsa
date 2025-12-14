import axios from "axios";

const server = axios.create({
  baseURL: `https://${window.location.hostname}:3042`,
});

export default server;
