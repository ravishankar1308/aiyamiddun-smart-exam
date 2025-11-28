'use client';

import React, { useState, useEffect } from 'react';
import { apiGetMetadata, apiUpdateMetadata } from '@/lib/api';
import type { Metadata } from '@/lib/api';

// Define the structure of a metadata item
interface MetadataItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the keys for the metadata we will be managing
const METADATA_KEYS = ['grades', 'subjects', 'sections', 'questionTypes'];

// --- Reusable Category Manager Component ---

interface MetadataCategoryManagerProps {
  title: string;
  initialItems: MetadataItem[];
  onSave: (items: MetadataItem[]) => Promise<void>;
}

const MetadataCategoryManager: React.FC<MetadataCategoryManagerProps> = ({ title, initialItems, onSave }) => {
  const [items, setItems] = useState<MetadataItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedItems: MetadataItem[]) => {
    setIsSaving(true);
    try {
      await onSave(updatedItems);
      setItems(updatedItems);
    } catch (error) {
      console.error(`Failed to save ${title}:`, error);
      // Optionally, show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() === '' || items.some(item => item.name === newItemName.trim())) {
      // Prevent adding empty or duplicate names
      return;
    }
    const newItem: MetadataItem = {
      id: Date.now(), // Use a temporary unique ID
      name: newItemName.trim(),
      isActive: true,
    };
    handleSave([...items, newItem]);
    setNewItemName('');
  };

  const handleToggleActive = (id: number) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    handleSave(updatedItems);
  };

  const handleDeleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    handleSave(updatedItems);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold capitalize mb-3">{title}</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={`New ${title.slice(0, -1)}...`}
          className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border rounded-md px-3 py-2"
        />
        <button
          onClick={handleAddItem}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-2 border-b">
            <span className={`${!item.isActive ? 'text-gray-400 line-through' : ''}`}>{item.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggleActive(item.id)} className="text-sm">{item.isActive ? 'Disable' : 'Enable'}</button>
              <button onClick={() => handleDeleteItem(item.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {isSaving && <p className="text-sm text-gray-500 mt-2">Saving...</p>}
    </div>
  );
};


// --- Main Page Component ---

const MetadataPage: React.FC = () => {
  const [metadata, setMetadata] = useState<Record<string, MetadataItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const responses = await Promise.all(METADATA_KEYS.map(key => apiGetMetadata<MetadataItem[]>(key)));
        const newMetadata = METADATA_KEYS.reduce((acc, key, index) => {
          // Initialize with empty array if value is null or undefined
          acc[key] = responses[index]?.value || []; 
          return acc;
        }, {} as Record<string, MetadataItem[]>);
        setMetadata(newMetadata);
      } catch (err) {
        setError('Failed to fetch metadata. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleSave = (key: string) => async (items: MetadataItem[]) => {
      await apiUpdateMetadata(key, items);
      setMetadata(prev => ({ ...prev, [key]: items }));
  };

  if (loading) return <div className="p-4">Loading metadata...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Metadata Management</h1>
      <p className='mb-6 text-gray-600'>Manage the core categories for your application like grades, subjects, and question types.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {METADATA_KEYS.map(key => (
            metadata[key] && (
                <MetadataCategoryManager 
                    key={key} 
                    title={key} 
                    initialItems={metadata[key]} 
                    onSave={handleSave(key)}
                />
            )
        ))}
      </div>
    </div>
  );
};

export default MetadataPage;
