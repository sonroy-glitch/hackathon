import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { vendorData } from "../state/atoms.jsx";
import * as XLSX from "xlsx";

const RfqGeneratorEx = () => {
  const [data, setData] = useState(null);
  const vendorHold = useRecoilValue(vendorData);
  const { vendor } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [boq, setBoq] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [quotationDeadline, setQuotationDeadline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const rfqData = {
    vendor: vendorHold.name,
    buyer: {
      name: user?.name,
      email: user?.email,
      company: user?.organisationName,
      contact: user?.phoneNumber,
    },
    boq,
    deliveryAddress,
    deliveryDeadline,
    quotationDeadline,
    paymentTerms,
  };

  const generateRFQ = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("http://localhost:3000/rfqGenerator", {
        rfqData,
      });
      setData(response.data);
    } catch (err) {
      setError("Failed to generate RFQ. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const sendToVendor = async () => {
    try {
      setLoadingVendor(true);
      const token = localStorage.getItem("token");
      setMessage(null);
      const buyerId = user.id;
      const vendorId = vendorHold.id;
      const response = await axios.post(
        "http://localhost:3000/rfq",
        {
          rfqData: data.answer,
          buyerId,
          vendorId,
        },
        { headers: { token } }
      );
      if (response.status === 200) {
        setMessage("RFQ sent to vendor successfully.");
        navigate("/dashboard");
      } else {
        setMessage(response.data.error);
      }
    } catch (err) {
      setMessage("Something went wrong while sending RFQ.");
    } finally {
      setLoadingVendor(false);
    }
  };

  // Handle file upload and extract BoQ data
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const ab = e.target.result;
        const workbook = XLSX.read(ab, { type: "array" });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const extractedData = data.slice(1).map((row) => ({
          productName: row[0], 
          productDescription: row[1], 
          quantity: row[2], 
          unit: row[3], 
        }));
         console.log(extractedData)
        setBoq(extractedData); // Update BoQ data
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        RFQ Generator
      </h1>
      <div>
        <p>Upload your Excel File below:</p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

    
      <div className="space-y-4 mb-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <input
            type="date"
            placeholder="Delivery Deadline"
            value={deliveryDeadline}
            onChange={(e) => setDeliveryDeadline(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            placeholder="Quotation Deadline"
            value={quotationDeadline}
            onChange={(e) => setQuotationDeadline(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
      </div>

      
      <button
        onClick={generateRFQ}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 mb-6 w-full"
        disabled={loading}
      >
        {loading ? "Generating RFQ..." : "Generate RFQ"}
      </button>

    
      {error && <p className="text-red-500">{error}</p>}

      
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        {data ? (
          <ReactMarkdown>{data.answer}</ReactMarkdown>
        ) : (
          <p className="text-gray-500">Your RFQ will appear here after generation.</p>
        )}
      </div>

      
      <button
        onClick={sendToVendor}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 mb-6 w-full"
        disabled={loadingVendor}
      >
        {loadingVendor
          ? `Sending to ${vendorHold.name}...`
          : `Send to ${vendorHold.name}`}
      </button>

      
      {message && (
        <p
          className={`mt-4 ${
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default RfqGeneratorEx;
