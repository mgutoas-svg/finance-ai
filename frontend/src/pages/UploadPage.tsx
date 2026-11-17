import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountId, setAccountId] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'ofx'>('pdf');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !accountId) {
      setError('Please select file and account');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', accountId);

      const endpoint = fileType === 'pdf' ? '/files/upload-pdf' : '/files/upload-ofx';
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`✓ ${data.transactionCount} transactions imported from ${data.total} found`);
      setFile(null);
      setAccountId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Import Transactions</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Back
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg">
          {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-900 text-green-200 p-4 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">File Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'pdf' | 'ofx')}
                className="w-full p-3 bg-gray-700 text-white rounded"
              >
                <option value="pdf">PDF Bank Statement</option>
                <option value="ofx">OFX File</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Account ID</label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Select or create account first"
                className="w-full p-3 bg-gray-700 text-white rounded"
                required
              />
              <p className="text-sm text-gray-400 mt-1">Link transactions to an account</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select File</label>
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) setFile(e.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept={fileType === 'pdf' ? '.pdf' : '.ofx'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  {file ? (
                    <p className="text-green-400">✓ {file.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-300 mb-2">Drag and drop your file here</p>
                      <p className="text-gray-500">or click to select</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded font-semibold"
            >
              {loading ? 'Uploading...' : 'Import Transactions'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-700 rounded">
            <h3 className="font-semibold mb-2">Supported Formats:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• PDF: Bank statements from major Brazilian banks</li>
              <li>• OFX: Standard OFX format (v1.0, v2.0)</li>
              <li>• Formats: Automatically detects date, amount, description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
