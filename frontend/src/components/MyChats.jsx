import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import { ChatLoading } from "./ChatLoading";
import { toast } from "react-toastify";
import { GroupChatModal } from "./GroupChatModal";
import { ChatState } from "../context/ChatProvider";

export const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  
  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    if (notification && notification.length > 0) {
      setNotification(notification.filter((n) => n.chat._id !== chat._id));
    }
  };
  
  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast.error("Failed to load the chats");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden" : "flex"
      } md:flex flex-col items-center p-3 bg-white w-full md:w-[31%] rounded-lg border border-gray-200 shadow-sm`}
    >
      {/* Header Section */}
      <div className="pb-3 px-3 text-2xl md:text-3xl font-sans flex w-full justify-between items-center font-semibold text-gray-800">
        My Chats
        <GroupChatModal>
          <button className="flex items-center text-sm lg:text-base py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all border border-gray-200">
            <span className="mr-2">New Group Chat</span>
            <i className="fas fa-plus text-xs"></i>
          </button>
        </GroupChatModal>
      </div>

      {/* Chats List Container */}
      <div className="flex flex-col p-3 bg-[#F8F8F8] w-full h-full rounded-lg overflow-y-hidden">
        {chats ? (
          <div className="flex flex-col space-y-2 overflow-y-auto scrollbar-thin">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`cursor-pointer px-3 py-3 rounded-lg transition-all duration-200 ${
                  selectedChat === chat 
                    ? "bg-[#38B2AC] text-white shadow-md" 
                    : "bg-[#E8E8E8] text-black hover:bg-gray-300"
                }`}
              >
                <p className="font-medium">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </p>
                {chat.latestMessage && (
                  <p className="text-xs mt-1 truncate">
                    <span className="font-bold">
                      {chat.latestMessage.sender.name}:{" "}
                    </span>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};