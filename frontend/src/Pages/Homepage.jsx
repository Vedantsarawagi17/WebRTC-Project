import { useEffect , useState } from "react";
import { useNavigate } from "react-router";
import { Login } from "../components/Login";
import { Signup } from "../components/Signup";

export function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  return (
    // Container
    <div className="max-w-xl mx-auto flex flex-col items-center w-full px-4">
      {/* Box for Title */}
      <div className="flex justify-center p-3 bg-white w-full mt-10 mb-4 rounded-lg border">
        <h1 className="text-4xl font-sans text-center">
          WebRTC-Chat Application
        </h1>
      </div>
      {/* Box for Auth Forms */}
      <div className="bg-white w-full p-4 rounded-lg border">
        {/* TabList Container - Added 'flex' and 'w-full' here */}
        <div className="flex w-full p-1 bg-gray-50 rounded-full border border-gray-100 mb-4">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === "login"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === "signup"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Sign Up
          </button>
        </div>
        {/* TabPanels */}
        <div className="mt-4">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
}