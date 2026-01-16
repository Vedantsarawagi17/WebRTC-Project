import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { ChatState } from "../context/ChatProvider";
import { UserBadgeItem } from "./UserBadgeItem";
import { UserListItem } from "./UserListItem";

export const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setIsOpen(false);
    setSearchResult([]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to Load Search Results");
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/rename`, 
        { chatId: selectedChat._id, chatName: groupChatName }, config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setGroupChatName("");
    } catch (error) {
      toast.error(error.response.data.message);
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast.error("User Already in group!");
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupadd`, 
        { chatId: selectedChat._id, userId: user1._id }, config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupremove`, 
        { chatId: selectedChat._id, userId: user1._id }, config
      );
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Eye Icon Button Replacement */}
      <button 
        onClick={onOpen}
        className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="text-3xl font-sans font-bold text-center mb-4 text-gray-800">
              {selectedChat.chatName}
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>

            {/* Body */}
            <div className="flex flex-col space-y-4">
              {/* Badges Container */}
              <div className="flex flex-wrap gap-2 w-full mb-2">
                {selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={selectedChat.groupAdmin}
                    handleFunction={() => handleRemove(u)}
                  />
                ))}
              </div>

              {/* Rename Section */}
              <div className="flex space-x-2">
                <input
                  className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="New Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <button
                  onClick={handleRename}
                  disabled={renameloading}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition-colors font-semibold disabled:opacity-50"
                >
                  {renameloading ? "..." : "Update"}
                </button>
              </div>

              {/* Search Section */}
              <input
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Add User to group"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* User Results */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => handleRemove(user)} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};