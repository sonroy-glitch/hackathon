import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  async function signup() {
    setIsLoading(true);
    
      const response = await axios.post("http://localhost:3000/signup", {
        name,
        email,
        password,
        organisationName:organisation,
        phoneNumber:phone,
        type:role
      });

      if (response.status === 200) {
        setMessage("Signup Success");
        localStorage.setItem("token",response.data.token)
        localStorage.setItem("type", (response.data.type));

        navigate("/dashboard");
      } else {
        setMessage(response.data.message);
      }
   
      setMessage("Error signing up. Please try again.");
   
      setIsLoading(false);
    
  }

  return (
    <div className="flex justify-center items-center bg-gray-100 ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md overflow-hidden">
        <h1 className="text-3xl font-semibold text-center mb-6">Sign Up</h1>

        {/* Input Fields */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Organisation Name"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Role Selector Dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="buyer">Buyer</option>
            <option value="vendor">Vendor</option>
          </select>

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center w-full relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Signup Button */}
        <button
          onClick={signup}
          disabled={isLoading}
          className={`w-full mt-6 py-3 text-lg rounded-md focus:outline-none ${
            isLoading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing Up...</span>
            </div>
          ) : (
            "Sign Up"
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

export default Signup;
