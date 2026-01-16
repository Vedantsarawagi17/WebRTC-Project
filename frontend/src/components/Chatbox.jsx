import "./styles.css";
import { SingleChat } from "./SingleChat";
import { ChatState } from "../context/ChatProvider";

export const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } md:flex flex-col items-center p-3 bg-white w-full md:w-[68%] rounded-lg border border-gray-200 shadow-sm`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};