import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Library used to make HTTP requests (send data to the backend).
import { useNavigate } from "react-router-dom";
import { ChatState } from "../context/ChatProvider";

export const Login = () => {
  const [show, setShow] = useState(false); // show: Toggles whether to show or hide the password text (dots vs readable text).
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  //loading: Disables the button while a request is being processed to prevent double-clicks.

  const history = useNavigate();
  const { setUser } = ChatState();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.warning("Please Fill all the Fields");
      setLoading(false);// It starts by setting loading to true.
      // what does loading true/false means ?
      return;
    }

    try { // what is this ??
      const config = { headers: { "Content-type": "application/json" } };
      const { data } = await axios.post("/api/user/login", { email, password }, config);

      toast.success("Login Successful");
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history("/chats");
    } catch (error) { 
      // why not toastify alert method ??
      toast.error(error.response?.data?.message || "Error Occurred!");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submitHandler(); }}>
    <div className="flex flex-col space-y-4 w-full">
      {/* Email Field */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter password"
          />
          <button
            type="button"
            className="absolute right-2 top-1.5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            onClick={handleClick}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        className={`w-full py-2 rounded-md font-bold text-white transition-all ${
          loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={submitHandler}
        disabled={loading}
      >
        {loading ? "Loading..." : "Login"}
      </button>

      {/* Guest Credentials Button */}
      <button
        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-all"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </button>
    </div>

    </form>
  );
};