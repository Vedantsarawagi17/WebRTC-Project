import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { ChatState } from "../context/ChatProvider";
import { UserBadgeItem } from "./UserBadgeItem";
import { UserListItem } from "./UserListItem";

export const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Replaces useDisclosure
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setIsOpen(false);
    setSearchResult([]);
    setSelectedUsers([]);
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast.warning("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
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

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `/api/chat/group`,
        { name: groupChatName, users: JSON.stringify(selectedUsers.map((u) => u._id)) },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast.success("New Group Chat Created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create the Chat!");
    }
  };

  return (
    <>
      <span onClick={onOpen} className="cursor-pointer">{children}</span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={onClose}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 overflow-hidden z-10">
            {/* Header */}
            <div className="text-center text-3xl font-sans font-bold mb-4">
              Create Group Chat
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            {/* Body */}
            <div className="flex flex-col space-y-3">
              <input
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Chat Name"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Add Users eg: John, Jane"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* Selected Users Badges */}
              <div className="flex flex-wrap gap-2 w-full">
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </div>

              {/* Search Results */}
              <div className="mt-2 max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-2">Loading...</div>
                ) : (
                  searchResult?.slice(0, 4).map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};