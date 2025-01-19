import React, { useState,useEffect } from "react";
import Signin from "../components/Signin";
import Signup from "../components/Signup";
import {useNavigate} from "react-router-dom"
const LandingPage = () => {
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate=useNavigate();
  const closeModal = () => {
    setShowSignin(false);
    setShowSignup(false);
  };
useEffect(() => {
  var user =JSON.parse(localStorage.getItem('user'));
  var token=localStorage.getItem('token')
  if(user && token){
    navigate("/dashboard")
  }
}, [])

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">
            Work<span className="text-blue-600">Wise</span>
          </div>
          <ul className="hidden md:flex space-x-8">
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                For Vendors
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Contact Us
              </a>
            </li>
          </ul>
          <div className="hidden md:flex space-x-4">
            <button
              onClick={() => setShowSignin(true)}
              className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-500"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Register
            </button>
          </div>
          <button className="md:hidden text-gray-800 focus:outline-none">
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center mt-40"
        style={{
          backgroundImage: "url('https://source.unsplash.com/1600x900/?industry,technology')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Maximise your profit through our AI-powered procurement solution
          </h1>
          <p className="text-lg mb-8">
            To know more, call <strong>9930787798</strong>
          </p>
            
          <p>Start your 30-day Free Trial Now</p>
        </div>
      </section>

      {/* Modal for Signin and Signup */}
      {(showSignin || showSignup) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {showSignin && <Signin />}
            {showSignup && <Signup />}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
