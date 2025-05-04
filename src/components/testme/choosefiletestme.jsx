import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { FaFile, FaRegFilePdf } from "react-icons/fa";

const TestMe = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for programmatic navigation
  const courseId = location.state?.courseId;
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files when component mounts
  useEffect(() => {
    const getFiles = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/getfiles?course=${courseId}`, {
          withCredentials: true,
        });
        const processedFiles = res.data.map(file => ({
          ...file,
          filename: file.url.split('/').pop().split('?')[0],
        }));
        setFiles(processedFiles);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };

    if (courseId) {
      getFiles();
    }
  }, [courseId]);

  // Handle file selection and navigate to testme page
  const handleFileSelection = (fileUrl) => {
    setSelectedFile(fileUrl);
    navigate('/testme', { state: { fileUrl } }); // Navigate to /testme with file URL
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Select a File</h2>

      {/* File selection */}
      <div className="flex flex-nowrap overflow-x-auto pb-4 -mx-4 px-4">
        {files.map((file) => (
          <label
            key={file.id}
            className={`flex-shrink-0 relative m-4 p-6 bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300
                ${selectedFile === file.url ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-105' : 'border-gray-200 hover:border-indigo-300 hover:shadow-xl'}`}
            style={{ minWidth: '250px' }}
            onClick={() => handleFileSelection(file.url)} // Trigger navigation
          >
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                  ${selectedFile === file.url ? 'bg-indigo-500' : 'bg-gray-300'}">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-4 text-indigo-600">
                <div className={`absolute inset-0 rounded-full transition-opacity ${selectedFile === file.url ? 'opacity-100 bg-indigo-100' : 'opacity-0'}`} />
                <FaFile className="text-5xl" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-1 right-1 text-red-500 bg-white rounded-full p-1 hover:text-red-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaRegFilePdf className="text-xl" />
                </a>
              </div>

              <div className="text-center">
                <p className={`font-medium text-sm line-clamp-2 ${selectedFile === file.url ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {file.filename}
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {Math.round(Math.random() * 5 + 1)} MB
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TestMe;
