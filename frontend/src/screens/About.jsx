import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const About = () => {
  const [aboutText, setAboutText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    var data = JSON.parse(localStorage.getItem('user'));
    setAboutText(data.answer);
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post("https://hackathon-wheat-xi.vercel.app/about", {
      about: aboutText
    }, {
      headers: { token }
    });

    if (response.status === 200) {
      alert("About Updated Successfully");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-center py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full sm:max-w-lg">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Update About</h1>
        <textarea
          className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
          placeholder="Write about your organization here..."
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
        />
        <button
          onClick={handleUpdate}
          className="bg-green-500 text-white mt-6 py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 w-full"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default About;
