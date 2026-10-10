import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { BsCloudUpload } from 'react-icons/bs';
import Papa from 'papaparse';
import { validateSchema } from './dataProcessor';

const Sidebar = ({ onClose, onDataset }) => {
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
      header: true,
      dynamicTyping: true,
      worker: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          setError('Could not parse that CSV. Please check the file format and try again.');
          setIsLoading(false);
          return;
        }
        try {
          const check = validateSchema(result.data);
          if (!check.ok) {
            setError(check.message);
            setIsLoading(false);
            return;
          }
          onDataset(result.data, file.name);
        } catch {
          setError('Something went wrong processing that file. Please try a different CSV.');
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        setError(`Could not read the file: ${err.message}`);
        setIsLoading(false);
      },
    });
  };

  return (
    <div
      className="fixed top-0 right-0 w-full max-w-md h-screen bg-white dark:bg-[#141517] border-l dark:border-[#343A40] shadow-2xl"
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center bg-blue-900 mb-4">
        <h2 className="text-lg text-white font-medium mx-4 my-4">Replace dataset</h2>
        <button
          className="text-lg text-gray-300 font-medium mr-4 hover:text-white transition duration-300 ease-in-out"
          onClick={onClose}
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>
      <div className="px-6">
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <BsCloudUpload className="mx-auto text-3xl text-gray-400" />
          <h3 className="mt-2 font-medium text-gray-900 dark:text-white">Upload an EV dataset (CSV)</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Expected columns: Make, Model, County, Model Year, Electric Vehicle Type, Electric Range…
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />
        </div>
        <button
          className="mt-4 w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          onClick={handleFileUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? 'Processing…' : 'Upload and replace'}
        </button>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        {isLoading && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Parsing… this can take a few seconds for large files.</p>}
      </div>
    </div>
  );
};

export default Sidebar;
