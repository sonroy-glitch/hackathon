import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { vendorData } from "../state/atoms.jsx";
import { rfqData } from "../state/atoms.jsx";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [activeTab, setActiveTab] = useState("Search Vendor");
  const [rfqs, setRfqs] = useState([]);
  const navigate = useNavigate();
  const setVendor = useSetRecoilState(vendorData);
  const setrfq = useSetRecoilState(rfqData);

  useEffect(() => {
    async function call() {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://hackathon-wheat-xi.vercel.app/verify", {
        headers: { token },
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      fetchVendors();
    }

    async function fetchVendors() {
      const response = await axios.get("https://hackathon-wheat-xi.vercel.app/sendVendors");
      setVendors(response.data.data);
    }

    call();
  }, []);

  useEffect(() => {
    const filtered = vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVendors(filtered);
  }, [searchQuery, vendors]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("type");
    navigate("/");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "RFQ Management") {
      const storedRfqs = JSON.parse(localStorage.getItem("user"))?.rfq || [];
      setRfqs(storedRfqs);
    }
  };

  var type = localStorage.getItem("type");
  if (type == "buyer") {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        
        <div className="bg-white shadow-lg py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
          >
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto mt-8 px-4 sm:px-8 lg:px-12">
          {activeTab === "Search Vendor" && (
            <>
              
              <div className="w-full mb-8">
                <input
                  type="text"
                  placeholder="Search Vendor by Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-full p-4 w-full max-w-4xl focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transition duration-300"
                />
              </div>

              
              <div className="w-full">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">
                  Available Vendors
                </h2>
                <div className="grid grid-cols-1 gap-8">
                  {filteredVendors.map((vendor, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-lg w-full hover:shadow-xl transform hover:scale-105 transition duration-300"
                    >
                      <h2 className="text-xl font-semibold text-blue-800 mb-2">
                        {vendor.name}
                      </h2>
                      <div className="mb-4">
                        <strong>Description:</strong> {vendor.about}
                      </div>
                      <div className="mb-4">
                        <strong>Contact Information:</strong>
                        <p className="text-gray-600">
                          <strong>Email:</strong> {vendor.email}
                        </p>
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {vendor.phoneNumber}
                        </p>
                      </div>

                      <div className="flex justify-end mt-4">
                        <div className="flex gap-4">
                          <button
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 shadow-md"
                            onClick={() => {
                              navigate(`/rfqGeneratorEx`);
                              setVendor(vendor);
                            }}
                          >
                            Generate RFQ via Excel Upload
                          </button>
                          <button
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 shadow-md"
                            onClick={() => {
                              navigate(`/rfqGenerator`);
                              setVendor(vendor);
                            }}
                          >
                            Generate RFQ via Data Entry
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredVendors.length === 0 && searchQuery && (
                  <p className="text-center text-gray-500 mt-6">
                    No vendors found matching "{searchQuery}".
                  </p>
                )}
              </div>
            </>
          )}

          {/* Display RFQs when RFQ Management tab is active */}
          {activeTab === "RFQ Management" && (
            <div>
              <h2 className="text-3xl font-bold text-blue-700 mb-4">
                Your RFQs
              </h2>
              <div className="space-y-6">
                {rfqs.map((rfq, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-md"
                    data-id={index}
                    onClick={(e) => {
                      setrfq(e.currentTarget.dataset.id);
                      navigate("/displayRfq");
                    }}
                  >
                    <h3 className="text-xl font-semibold text-blue-800">
                      {rfq.title}
                    </h3>
                    <p className="text-gray-600">
                      <strong>Vendor Name:</strong> {rfq.vendor.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Vendor Email:</strong> {rfq.vendor.email}
                    </p>
                    <p className="text-gray-600">
                      <strong>Vendor Phone:</strong> {rfq.vendor.phoneNumber}
                    </p>

                    <button
                      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                      onClick={() =>
                        navigate("/rfqDetails", { state: { rfq } })
                      }
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {rfqs.length === 0 && (
                <p className="text-center text-gray-500 mt-6">No RFQs found.</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md py-3 px-6 flex justify-around items-center">
          <button
            className={`text-lg font-semibold px-4 py-2 rounded-md ${
              activeTab === "Search Vendor"
                ? "bg-blue-500 text-white"
                : "text-blue-600 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange("Search Vendor")}
          >
            Search Vendor
          </button>
          <button
            className={`text-lg font-semibold px-4 py-2 rounded-md ${
              activeTab === "RFQ Management"
                ? "bg-blue-500 text-white"
                : "text-blue-600 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange("RFQ Management")}
          >
            RFQ Management
          </button>
          <button
            className={`text-lg font-semibold px-4 py-2 rounded-md ${
              activeTab === "Review Tenders"
                ? "bg-blue-500 text-white"
                : "text-blue-600 hover:bg-gray-100"
            }`}
            onClick={() => navigate("/displayTenders")}
          >
            Review Tenders
          </button>
        </div>
      </div>
    );
  } else if (type == "vendor") {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100">
        <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100">
          <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-700">
              Vendor Dashboard
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/updateAbout")}
                className="bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition duration-300 shadow-md"
              >
                Update About
              </button>
              <button
                onClick={handleSignOut}
                className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto mt-8 px-4 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Welcome, Vendor
          </h2>
          <p className="text-gray-600">
            Use the menu below to review RFQs and upload tenders.
          </p>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md py-3 px-6 flex justify-around items-center">
          <button
            className="text-lg font-semibold px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition duration-300 shadow-md"
            onClick={() => navigate("/seller/vendorDisp")}
          >
            Review RFQs and Upload Tenders
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
