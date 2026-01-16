import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ChatLoading } from "./ChatLoading";
import { toast } from "react-toastify";
import { ProfileModal } from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../config/ChatLogics";
import { UserListItem } from "./UserListItem";
import { ChatState } from "../context/ChatProvider";

export function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false); // Shows a spinner while creating a 1-on-1 chat
  
  // State for Drawer and Menus
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to Load the Search Results");
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Error fetching the chat: " + error.message);
      setLoadingChat(false);
    }
  };

  return (
    <>
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center bg-white w-full py-2 px-4 border-b-4 border-gray-100">
        {/* Search Button */}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors group"
        >
          <i className="fas fa-search text-gray-600 group-hover:text-blue-500"></i>
          <span className="hidden md:flex font-medium text-gray-700">Search User</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl font-sans font-bold text-gray-800">Talk-A-Tive</h1>

        {/* Action Icons */}
        <div className="flex items-center space-x-4 relative">
          
          {/* Notification Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 relative hover:bg-gray-100 rounded-full"
            >
              <NotificationBadge count={notification.length} effect={Effect.SCALE} />
              <i className="fas fa-bell text-xl"></i>
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50 py-2">
                {!notification.length && <div className="px-4 py-2 text-sm text-gray-500">No New Messages</div>}
                {notification.map((notif) => (
                  <div
                    key={notif._id}
                    className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer truncate"
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                      setIsNotificationOpen(false);
                    }}
                  >
                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded-md"
            >
              <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full border" />
              <i className="fas fa-chevron-down text-xs text-gray-500"></i>
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 overflow-hidden">
                <ProfileModal user={user}>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">My Profile</button>
                </ProfileModal>
                <hr />
                <button onClick={logoutHandler} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- SIDE DRAWER --- */}
      {/* Background Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* Drawer Content */}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b text-xl font-bold">Search Users</div>
        <div className="p-4">
          <div className="flex space-x-2 mb-4">
            <input
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Go</button>
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
              ))
            )}
            {loadingChat && <div className="flex justify-center mt-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}
          </div>
        </div>
      </aside>
    </>
  );
}