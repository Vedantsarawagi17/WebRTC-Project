import "./App.css";
import { Homepage } from "./Pages/Homepage";
import { Routes, Route } from "react-router-dom";
import { ChatPage } from "./Pages/Chatpage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path="/" element = {<Homepage />} exact />
        <Route path="/chats" element = {<ChatPage />} />
      </Routes>
    </div>
  );
}
