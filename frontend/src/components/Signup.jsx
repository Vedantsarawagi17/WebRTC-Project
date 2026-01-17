import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../context/ChatProvider";

export const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  // picLoading: Boolean to show a loading state while the image is uploading. 
  // what is pic loading it ia inbuilt function or what ??

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setPicLoading(true);
    if (!pics) {
      toast.warning("Please select an image");
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");
      // hange these details to your cloudinary details .

      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", { // Uses fetch to send the image data to Cloudinary's API.
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast.error("Please select a JPEG or PNG image");
      setPicLoading(false);
    }
  };

  const submitHandler = async () => {
    setPicLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast.warning("Please fill all the fields");
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast.warning("Passwords do not match");
      setPicLoading(false);
      return;
    }

    try {// what is config etc ??
      const config = { headers: { "Content-type": "application/json" } };
      const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
      
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred!");
      setPicLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Toast handles notifications now */}

      {/* Name Input */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">Name *</label>
        <input
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter Your Name"
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Email Input */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">Email Address *</label>
        <input
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          type="email"
          placeholder="Enter Your Email Address"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">Password *</label>
        <div className="relative">
          <input
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black"
            onClick={handleClick}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">Confirm Password *</label>
        <div className="relative">
          <input
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            autoComplete="new-password"
            onChange={(e) => setConfirmpassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black"
            onClick={handleClick}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* File Upload Input */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-semibold text-gray-700">Upload your Picture</label>
        <input
          className="w-full px-3 py-1.5 border rounded-md file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          type="file"
          // what does accept do , how does it work ??
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </div>

      {/* Submit Button */}
      <button
        className={`w-full mt-4 py-2 rounded-md font-bold text-white transition-all ${
          picLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }` }
        onClick={submitHandler}
        disabled={picLoading}
      >
        {picLoading ? "Processing..." : "Sign Up"}
      </button>
    </div>
  );
};