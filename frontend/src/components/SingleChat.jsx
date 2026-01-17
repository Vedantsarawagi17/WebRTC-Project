import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ProfileModal } from "./ProfileModal";
import { ScrollableChat } from "./ScrollableChat";
import Lottie from "lottie-react";
import { UpdateGroupChatModal } from "./UpdateGroupChatModal";
import { ChatState } from "../context/ChatProvider";
import { VideoState } from "../context/VideoProvider"; // Import VideoState
import { FaVideo } from "react-icons/fa";

// It contains the mathematical data to render the "Three Bouncing Dots" animation that appears when someone is typing in your chat.
import animationData from "../animations/typing.json";

export const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  // Destructure joinVideoRoom from VideoState, keep others from ChatState
  const { selectedChat, setSelectedChat, user, notification, setNotification, socket } = ChatState();
  const { joinVideoRoom } = VideoState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socket) socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Failed to Load the Messages");
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      if (socket) socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
        };
        const messageToSend = newMessage;
        setNewMessage("");
        const { data } = await axios.post("/api/message", { content: messageToSend, chatId: selectedChat._id }, config);
        if (socket) socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        toast.error("Failed to send the Message");
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;
    
    // In SingleChat, we only care about appending to the visible messages list
    const chatMessageListener = (newMessageReceived) => {
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
        console.log("SingleChat: Appending message for active chat");
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message recieved", chatMessageListener);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("message recieved", chatMessageListener);
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat]); // Re-attach when selection changes to ensure closure has current ID

  // Note: Keeping it without deps but with cleanup to ensure it has latest state, 
  // though typically [notification, messages] would be better. 
  // Actually, standard practice in this specific app (RoadsideCoder tutorial style) 
  // often uses the empty array or the notification dependency.

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {selectedChat ? (
        <>
          {/* HEADER */}
          <div className="text-2xl md:text-3xl pb-3 px-2 w-full font-sans flex justify-between items-center text-gray-800">
            {/* Back Button for Mobile */}
            <button
              onClick={() => setSelectedChat("")}
              className="flex md:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <div className="flex items-center gap-4">
                <button 
                  onClick={() => joinVideoRoom()}
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors text-gray-700"
                >
                  <FaVideo className="text-xl" />
                </button>
                   <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </div>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </div>

          {/* MESSAGES BOX */}
          <div className="flex flex-col justify-end p-3 bg-[#E8E8E8] w-full h-full rounded-lg overflow-y-hidden relative">
            {loading ? (
              <div className="flex items-center justify-center m-auto">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto scrollbar-hide">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* INPUT AREA */}
            <div className="mt-3 flex flex-col">
              {istyping && (
                <div className="mb-2 ml-0">
                  <Lottie options={defaultOptions} width={70} style={{ marginLeft: 0 }} />
                </div>
              )}
              <input
                className="w-full p-3 bg-[#E0E0E0] rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter a message.."
                value={newMessage}
                onKeyDown={sendMessage}
                onChange={typingHandler}
              />
            </div>
          </div>
        </>
      ) : (
        /* INITIAL SCREEN */
        <div className="flex items-center justify-center h-full">
          <p className="text-3xl pb-3 font-sans text-gray-400">
            Click on a user to start chatting
          </p>
        </div>
      )}
    </div>
  );
};