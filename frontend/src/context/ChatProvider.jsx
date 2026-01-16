import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

// This will act as the container for all the global states we want to share.
const ChatContext = createContext();
// Use env var or fallback to localhost
const ENDPOINT = import.meta.env.VITE_BACKEND_URL;

export const ChatProvider = ({ children }) => {
  // Debug checks
  console.log("ChatProvider Init");
  const [selectedChat, setSelectedChat] = useState(); // Stores the chat currently open/active
  const [user, setUser] = useState(); // Stores the logged-in user's information
  const [notification, setNotification] = useState([]); //  An array to store new message notifications.
  const [chats, setChats] = useState(); // Stores the list of all chats the user is part of.
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  // Socket initialization
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) navigate("/");

    const newSocket = io(ENDPOINT);
    setSocket(newSocket);
    newSocket.emit("setup", userInfo);

    return () => newSocket.close();
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};