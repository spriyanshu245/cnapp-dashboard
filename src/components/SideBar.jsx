import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Papa from 'papaparse';
import { processEVData, rangeDistribution } from './dataProcessor';

const Sidebar = ({ setData, onClose }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleFileUpload = () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.');
          setIsLoading(false);
          return;
        }

        try {
          const processedData = processEVData(result.data);
          setData(processedData);
          setIsLoading(false);
        } catch (err) {
          setError('Error processing data. Please check the file content.');
          setIsLoading(false);
        }
      },
      header: true,
      dynamicTyping: true,
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  return (
    <div
      className="fixed top-0 right-0 max-w-5xl h-screen bg-white dark:bg-[#141517] border-l dark:border-[#343A40]"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center bg-blue-900 mb-4">
        <h2 className="text-lg text-white font-medium mx-4 my-4 dark:text-gray-300">Add Widget</h2>
        <button
          className="text-lg text-gray-300 font-medium mr-4 dark:text-gray-300 hover:text-white dark:hover:text-white transition duration-300 ease-in-out dark:transition dark:duration-300 dark:ease-in-out"
          onClick={onClose}
        >
          <RxCross2 />
        </button>
      </div>      
      <div className="file-upload">
        <h3>Upload EV Data CSV</h3>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          disabled={isLoading}
        />
        <button 
          className="flex items-center rounded-md m-3 p-2 text-sm dark:bg-[#1F1F1F] bg-white border dark:border-[#343A40] text-black dark:text-white"
          onClick={handleFileUpload} 
          disabled={!file || isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload and Process'}
        </button>
        {error && <p className="error">{error}</p>}
        {isLoading && <p>Loading... Please wait.</p>}
      </div>
    </div>
  );
};

export default Sidebar;