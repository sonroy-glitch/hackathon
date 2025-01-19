import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [type, setType] = useState("");
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  async function signin() {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post("http://localhost:3000/signin", {
        email,
        password,
        type,
      });
      if (response.status === 200) {
        localStorage.setItem("type", (response.data.type));
        localStorage.setItem("token", response.data.token);
        setMessage("Signin Success");
        navigate("/dashboard");
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      setMessage("Error signing in. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-100 ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md overflow-hidden">
        <h1 className="text-3xl font-semibold text-center mb-6">Sign In</h1>

        {/* Role Selector */}
        <div className="flex justify-between mb-6">
          <div
            onClick={() => setType("buyer")}
            className={`cursor-pointer px-6 py-2 rounded-md text-lg ${
              type === "buyer" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Buyer
          </div>
          <div
            onClick={() => setType("vendor")}
            className={`cursor-pointer px-6 py-2 rounded-md text-lg ${
              type === "vendor" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Vendor
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center w-full relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 text-gray-500 text-sm focus:outline-none"
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={signin}
          disabled={isLoading} // Disable button when loading
          className={`w-full mt-6 py-3 text-lg rounded-md focus:outline-none ${
            isLoading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Message */}
        {message && (
          <p className="text-center text-red-500 mt-4 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Signin;
