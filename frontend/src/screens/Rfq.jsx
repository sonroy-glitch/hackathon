import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { vendorData } from "../state/atoms.jsx";
import {useNavigate} from "react-router-dom"
const Rfq = () => {
  const [data, setData] = useState(null);
  const vendorHold = useRecoilValue(vendorData);
  const { vendor } = useParams();
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [rows, setRows] = useState([{ serialno: 1, productName: "", productDescription: "", quantity: "", unit: "" }]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [quotationDeadline, setQuotationDeadline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const addRow = () => {
    setRows((prevState) => [
      ...prevState,
      { serialno: prevState.length + 1, productName: "", productDescription: "", quantity: "", unit: "" },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const rfqData = {
    vendor: vendorHold.name,
    buyer: {
      name: user?.name,
      email: user?.email,
      company: user?.organisationName,
      contact: user?.phoneNumber,
    },
    boq: rows,
    deliveryAddress,
    deliveryDeadline,
    quotationDeadline,
    paymentTerms,
  };

  const generateRFQ = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("https://hackathon-wheat-xi.vercel.app/rfqGenerator", { rfqData });
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
      const token=localStorage.getItem('token')
      console.log(token)
      setMessage(null);
      const buyerId = user.id;
      const vendorId = vendorHold.id;
      const response = await axios.post("http://localhost:3000/rfq", {
        rfqData: data.answer,
        buyerId,
        vendorId,
      },{headers:{token}});
      if (response.status === 200) {
        setMessage("RFQ sent to vendor successfully.");
        navigate("/dashboard")
      } else {
        setMessage(response.data.error);
      }
    } catch (err) {
      setMessage("Something went wrong while sending RFQ.");
    } finally {
      setLoadingVendor(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">RFQ Generator</h1>

      <div className="overflow-x-auto mb-6">
        <table className="w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Product Name</th>
              <th className="px-4 py-2 text-left">Product Description</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td>
                  <input
                    type="text"
                    value={row.productName}
                    onChange={(e) => handleRowChange(index, "productName", e.target.value)}
                    className="px-2 py-1 w-full border border-gray-300 rounded-md"
                    placeholder="Product Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.productDescription}
                    onChange={(e) => handleRowChange(index, "productDescription", e.target.value)}
                    className="px-2 py-1 w-full border border-gray-300 rounded-md"
                    placeholder="Product Description"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                    className="px-2 py-1 w-full border border-gray-300 rounded-md"
                    placeholder="Quantity"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) => handleRowChange(index, "unit", e.target.value)}
                    className="px-2 py-1 w-full border border-gray-300 rounded-md"
                    placeholder="Unit"
                  />
                </td>
                <td>
                  {rows.length > 1 && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      onClick={() => setRows(rows.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-6 hover:bg-green-600"
      >
        Add New Row
      </button>

      <div className="space-y-4 mb-6">
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
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 mb-6 w-full"
        onClick={sendToVendor}
        disabled={loadingVendor}
      >
        {loadingVendor ? `Sending to ${vendorHold.name}...` : `Send to ${vendorHold.name}`}
      </button>

      {message && <p className={`mt-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
    </div>
  );
};

export default Rfq;
