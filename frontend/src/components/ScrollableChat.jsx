import { useEffect, useRef } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";

export const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="overflow-y-auto overflow-x-hidden h-full scrollbar-hide">
      {messages &&
        messages.map((m, i) => (
          <div className="flex" key={m._id}>
            {/* Avatar & Tooltip Logic */}
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <div className="relative group flex items-center">
                <img
                  src={m.sender.pic}
                  alt={m.sender.name}
                  className="w-8 h-8 rounded-full cursor-pointer mt-2 mr-1 object-cover"
                />
                {/* Custom Tooltip replacement */}
                <span className="absolute bottom-8 left-0 scale-0 transition-all rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 z-50">
                  {m.sender.name}
                </span>
              </div>
            )}

            {/* Message Bubble */}
            <span
              className={`rounded-2xl px-4 py-2 max-w-[75%] shadow-sm`}
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? "3px" : "10px",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      <div ref={bottomRef} />
    </div>
  );
};