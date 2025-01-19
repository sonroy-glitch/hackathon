import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import {useRecoilValue} from "recoil"
import { tenderLink } from "../state/atoms";

const TenderView = () => {
  const [summary, setSummary] = useState(null);
  const url = useRecoilValue(tenderLink);
  const [summaryView, setSummaryView] = useState(false);
  const [qaadiv, setQaadiv] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQAA, setLoadingQAA] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await axios.post("https://hackathon-wheat-xi.vercel.app/summarize", {
          url,
        });
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching summary:", error.message);
      }
    }
    fetchSummary();
  }, []);

  async function run() {
    setLoadingQAA(true);
    try {
      const response = await axios.post("https://hackathon-wheat-xi.vercel.app/qaaFeature", {
        url,
        question,
      });
      setChat((prevData) => [
        ...prevData,
        { question, answer: response.data.answer },
      ]);
      setAnswer(response.data.answer); 
    } catch (error) {
      console.error("Error in QAA:", error.message);
    } finally {
      setLoadingQAA(false); 
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tender Viewer</h1>
        <div className="mt-6 flex justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300"
          >
            Download Tender PDF
          </a>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mb-4"
          onClick={() => {
            setLoadingSummary(true);
            setSummaryView(true);
            setLoadingSummary(false);
          }}
        >
          Summarize
        </button>
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          {loadingSummary ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : summary && summaryView ? (
            <ReactMarkdown className="prose">{summary.summary}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">
              Click "Summarize" to view the summary of the document.
            </p>
          )}
        </div>

        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md mb-4"
          onClick={() => setQaadiv(true)}
        >
          Initiate QAA
        </button>

        {qaadiv && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-4 mb-4">
              {chat.map((chatItem, index) => (
                <div key={index} className="p-3 bg-white shadow-sm rounded-md">
                  <p className="text-gray-800">
                    <strong>Q:</strong> {chatItem.question}
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>A:</strong>{" "}
                    <ReactMarkdown
                      className="prose"
                      components={{
                        p: ({ node, children }) => <p>{children}</p>,
                        div: ({ node, children, ...props }) => (
                          <div {...props}>{children}</div>
                        ),
                      }}
                    >
                      {chatItem.answer}
                    </ReactMarkdown>
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Enter your Question Here"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-300"
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e)=>{
                  if(e.key==="Enter"){
                    run();
                  }
                }}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
                onClick={run}
              >
                {loadingQAA ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderView;
