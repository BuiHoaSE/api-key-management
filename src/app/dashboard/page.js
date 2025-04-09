'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';

export default function Dashboard() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiresIn: 30 // Default 30 days
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setApiKeys(data);
      // Initialize visibility state for new keys
      const initialVisibility = {};
      data.forEach(key => {
        initialVisibility[key.id] = false; // Initially hide all keys
      });
      setVisibleKeys(initialVisibility);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      showToast('API key was copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const handleEditClick = (key) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      description: key.description,
      expiresIn: 30 // You might want to calculate remaining days here
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/keys/${editingKey.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedKey = await response.json();
        setApiKeys(prevKeys => 
          prevKeys.map(key => 
            key.id === editingKey.id ? updatedKey : key
          )
        );
        setIsEditModalOpen(false);
        setEditingKey(null);
        setFormData({ name: '', description: '', expiresIn: 30 });
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setEditingKey(null);
    setFormData({ name: '', description: '', expiresIn: 30 });
    router.refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      fetchApiKeys();
      setIsModalOpen(false);
      setFormData({ name: '', description: '', expiresIn: 30 });
      showToast('API key created successfully!', 'success');
    } catch (error) {
      console.error('Error creating API key:', error);
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchApiKeys();
        showToast('API key was deleted!', 'error');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const maskApiKey = (key) => {
    return '•'.repeat(key.length);
  };

  const renderModal = (isEdit = false) => {
    const modalTitle = isEdit ? "Edit API Key" : "Create New API Key";
    const handleModalSubmit = isEdit ? handleEditSubmit : handleSubmit;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
          <form onSubmit={handleModalSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            </div>
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiresIn">
                  Expires In (days)
                </label>
                <input
                  type="number"
                  id="expiresIn"
                  value={formData.expiresIn}
                  onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {isEdit ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Toast show={toast.show} message={toast.message} type={toast.type} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="mb-8 rounded-xl overflow-hidden" style={{
            background: 'linear-gradient(120deg, rgb(236, 182, 182) 0%, rgb(181, 172, 212) 50%, rgb(150, 172, 225) 100%)'
          }}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-white text-sm font-medium mb-2">CURRENT PLAN</div>
                  <h2 className="text-white text-4xl font-bold mb-6">Researcher</h2>
                </div>
                <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 backdrop-blur-sm">
                  Manage Plan
                </button>
              </div>

              <div className="text-white/90 mb-2">API Usage</div>
              <div className="bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-white/90">
                <span>Plan</span>
                <span>1/1,000 Credits</span>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5" />
                  New API Key
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                The key is used to authenticate your requests to the Research API.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Options</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">dev</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {visibleKeys[key.id] ? key.key : maskApiKey(key.key)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title={visibleKeys[key.id] ? "Hide API Key" : "Show API Key"}
                          >
                            {visibleKeys[key.id] ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyKey(key.key)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Copy API Key"
                          >
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(key)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit API Key"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(key.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Delete API Key"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && renderModal(false)}

        {/* Edit Modal */}
        {isEditModalOpen && renderModal(true)}
      </div>
    </div>
  );
} 