import "./polyfills"; // MUST BE FIRST
import axios from "axios";
import ReactDOM from "react-dom/client";
import "./App.css";
import { App } from "./App";
import { ChatProvider } from "./context/ChatProvider";
import { VideoProvider } from "./context/VideoProvider"; // Import VideoProvider
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL ;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ErrorBoundary>
    <BrowserRouter>
      <ChatProvider>
        <VideoProvider>
          <App />
        </VideoProvider>
      </ChatProvider>
    </BrowserRouter>
  </ErrorBoundary>
);