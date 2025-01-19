import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { rfqHolder } from '../state/atoms';
import { useNavigate } from 'react-router-dom';

const VendorDisp = () => {
  const data = JSON.parse(localStorage.getItem('user')) || { rfq: [] };
  const [index, setIndex] = useState(0);
  const setRfq = useSetRecoilState(rfqHolder);
  const navigate = useNavigate();

  async function handleRfqSelection(selectedIndex) {
    setRfq(data.rfq[selectedIndex]);
    navigate('/seller/tenderUpload');
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Available RFQs</h1>

      {data.rfq.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.rfq.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
              data-id={idx}
              onClick={() => handleRfqSelection(idx)}
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-2">
                {item.buyer.organisationName}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Name:</strong> {item.buyer.name}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Email:</strong> {item.buyer.email}
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> {item.buyer.phoneNumber}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-6">
          No RFQs available at the moment.
        </p>
      )}
    </div>
  );
};

export default VendorDisp;
