import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { tenderLink } from "../state/atoms";
import { useNavigate } from "react-router-dom";

const DisplayTenders = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigate = useNavigate();
  const setTenderLink = useSetRecoilState(tenderLink);
  const data = JSON.parse(localStorage.getItem("user"));
  const tenders = data?.tender || [];

  // Handle click on a tender
  const handleTenderClick = (index) => {
    setSelectedIndex(index);
    const link = tenders[index].tender;
    setTenderLink(link);
    navigate("/buyer/tenderView");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Received Tenders from Vendors
      </h1>

      {tenders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No tenders received at the moment.
        </p>
      ) : (
        <div className="space-y-4">
          {tenders.map((item, index) => (
            <div
              key={index}
              onClick={() => handleTenderClick(index)}
              className={`border ${
                selectedIndex === index ? "border-blue-500" : "border-gray-300"
              } rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200`}
            >
              <h2 className="text-lg font-semibold text-gray-700">
                {item.vendor.organisationName}
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {item.vendor.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Description:</span> {item.vendor.description}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${item.vendor.email}`}
                  className="text-blue-500 hover:underline"
                >
                  {item.vendor.email}
                </a>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {item.vendor.phoneNumber}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayTenders;
