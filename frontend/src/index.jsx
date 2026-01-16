import "./polyfills"; // MUST BE FIRST
import "./axiosConfig"; // Global Axios Config
import ReactDOM from "react-dom/client";
import "./App.css";
import { App } from "./App";
import { ChatProvider } from "./context/ChatProvider";
import { VideoProvider } from "./context/VideoProvider"; // Import VideoProvider
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

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

// reportWebVitals(console.log);
