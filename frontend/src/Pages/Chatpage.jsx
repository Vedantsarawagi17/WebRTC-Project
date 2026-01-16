import { useState } from "react";
import { Chatbox } from "../components/Chatbox";
import { MyChats } from "../components/MyChats";
import { SideDrawer } from "../components/SideDrawer";
import { ChatState } from "../context/ChatProvider";
import VideoCallModal from "../components/VideoCallModal";

export const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="w-full">
      {/* Navigation / Search Bar */}
      {user && <SideDrawer />}
      <VideoCallModal />

      {/* Main Chat Layout Container */}
      <div className="flex justify-between w-full h-[91.5vh] p-2.5">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </div>
    </div>
  );
};