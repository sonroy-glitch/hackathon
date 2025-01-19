import React from 'react';
import { useRecoilValue } from "recoil";
import { rfqData } from "../state/atoms.jsx";
import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom';

const DisplayRfq = () => {
  const index = useRecoilValue(rfqData);
  const data = JSON.parse(localStorage.getItem('user'));
  const rfqHold = data?.rfq?.[index];

  const navigate = useNavigate(); 
  if (!rfqHold || !rfqHold.vendor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 to-indigo-200">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl text-center">
          <p className="text-xl font-light text-gray-600">No RFQ or Vendor data available.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg font-bold rounded-lg shadow-xl transform hover:scale-105 hover:from-indigo-700 hover:to-indigo-900 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 to-indigo-200">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h2 className="text-4xl font-extrabold text-gradient bg-clip-text text-transparent mb-6">
          Vendor Information
        </h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-2xl font-semibold text-indigo-700 tracking-wide">
            <span className="font-bold text-indigo-900">Vendor Name:</span> {rfqHold.vendor.name}
          </p>
          <p className="text-2xl font-semibold text-indigo-700 tracking-wide">
            <span className="font-bold text-indigo-900">Email:</span> {rfqHold.vendor.email}
          </p>
          <p className="text-2xl font-semibold text-indigo-700 tracking-wide">
            <span className="font-bold text-indigo-900">Phone Number:</span> {rfqHold.vendor.phoneNumber}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-3xl font-semibold text-gradient bg-clip-text text-transparent mb-3">
            RFQ Details:
          </h3>
          <ReactMarkdown className="prose text-gray-700 font-serif leading-relaxed tracking-wide">{rfqHold.rfq || "No RFQ content available."}</ReactMarkdown>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg font-bold rounded-lg shadow-xl transform hover:scale-105 hover:from-indigo-700 hover:to-indigo-900 transition duration-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DisplayRfq;
