import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {useRecoilValue} from "recoil"
import {rfqHolder} from "../state/atoms"
import {useNavigate} from "react-router-dom"
const TenderUpload = () => {
  const [file, setFile] = useState(null);
  // const [view, setView] = useState(null);
  const navigate=useNavigate();
  const [uploadUrl, setUploadUrl] = useState('');
  const [summary, setSummary] = useState(null);
  const userData = JSON.parse(localStorage.getItem('user'));
  const token= localStorage.getItem('token')
  const rfq= useRecoilValue(rfqHolder);
  const [uploadChecker,setUploadChecker]=useState(1)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  // console.log(userData.tender.buyer)
   useEffect(() => {
     userData.tender.map((item)=>{
        if(item.rfqId==rfq.id){
           setUploadChecker(0)
           setUploadUrl(item.tender);
        }
     })
   }, [])
   
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hackathon');
      formData.append('resource_type', 'raw');

      // Upload file to Cloudinary
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dxivftm25/raw/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadUrl(response.data.secure_url);
      const response1= await axios.post("https://hackathon-wheat-xi.vercel.app/tender",{
        tenderLink:response.data.secure_url,
        buyerId:rfq.buyer.id,
        vendorId:userData.id,
        rfqId:rfq.id
      },{
        headers:{token}
      })
      if(response1.status==200){
      alert('File uploaded successfully');
        navigate("/dashboard")
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* RFQ Display */}
      {rfq && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Request for Quotation (RFQ)</h2>
          <ReactMarkdown className="prose max-w-full">{rfq.rfq}</ReactMarkdown>
         
        </div>
      )}
      {
        uploadChecker?
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">Upload Tender Document</h3>
        <div className="mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Upload
        </button>
      </form>
        </div>
        : <div>
          Tender already Uploaded.Contact Buyer at {rfq.buyer.email}.
        </div>

      }
      {/* File Upload Form */}
      
      {/* Display Uploaded File URL */}
      {uploadUrl && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-green-700 mb-4">Uploaded File URL</h3>
          <a
            href={uploadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {uploadUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default TenderUpload;
