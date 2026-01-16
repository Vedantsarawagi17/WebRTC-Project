import axios from "axios";

// Automatically uses VITE_API_URL enviroment variable
// If not set (dev), it defaults to empty string which means relative path (good for proxy)
// OR you can default to localhost if you prefer hitting backend directly
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL ;
// axios.defaults.withCredentials = true; // Use this if you implement cookie-based auth later
