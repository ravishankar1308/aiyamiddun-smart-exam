// frontend/src/app/dashboard/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, List, Filter, Plus, Edit2, Eye, EyeOff, X, Check } from 'lucide-react';
import { apiGetMetadata, apiUpdateMetadata } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// --- Helper Components for Settings ---
const ListItem = ({ item, onEdit, onToggle, onDelete, extraInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(item.name);
  const handleSave = () => { onEdit(item.id, editVal); setIsEditing(false); };
  return (
    <div className={`flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 group ${!item.active ? 'opacity-60 bg-slate-100' : ''}`}>
      <div className="flex-1">{isEditing ? (<div className="flex gap-2"><input value={editVal} onChange={e => setEditVal(e.target.value)} className="p-1 border rounded text-sm w-full" autoFocus /><button onClick={handleSave} className="text-green-600"><Check size={16}/></button></div>) : (<div className="flex flex-col"><span className={`text-sm font-medium text-slate-700 ${!item.active ? 'line-through text-slate-400' : ''}`}>{item.name}</span>{extraInfo && <span className="text-xs text-slate-400">{extraInfo}</span>}</div>)}</div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setIsEditing(!isEditing)} className="p-1 text-slate-400 hover:text-blue-500"><Edit2 size={14}/></button><button onClick={() => onToggle(item.id)} className={`p-1 ${item.active ? 'text-slate-400 hover:text-orange-500' : 'text-orange-500'}`}>{item.active ? <Eye size={14}/> : <EyeOff size={14}/>}</button><button onClick={() => onDelete(item.id)} className="p-1 text-slate-400 hover:text-red-500"><X size={14}/></button></div>
    </div>
  );
};

const SimpleMetadataEditor = ({ title, items = [], onAdd, onEdit, onToggle, onDelete, placeholder }) => {
  const [newValue, setNewValue] = useState('');
  const handleAdd = () => { if (!newValue.trim()) return; onAdd({ name: newValue.trim() }); setNewValue(''); };
  return (<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><List size={18} className="text-blue-500"/> {title}</h3><div className="flex gap-2 mb-4"><input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={placeholder} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none"/><button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={18} /></button></div><div className="flex-1 overflow-y-auto space-y-2 max-h-48 custom-scrollbar">{items.map((item) => (<ListItem key={item.id} item={item} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />))}</div></div>);
};

const SubjectMetadataEditor = ({ grades, subjects = [], onAdd, onEdit, onToggle, onDelete }) => {
  const [grade, setGrade] = useState(''); const [name, setName] = useState(''); const [filterGrade, setFilterGrade] = useState('');
  const handleAdd = () => { if (!grade || !name) return; onAdd({ name, grade }); setName(''); };
  const filteredSubjects = filterGrade ? subjects.filter(s => s.grade === filterGrade) : subjects;
  return (<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><List size={18} className="text-purple-500"/> Subjects</h3><div className="flex items-center gap-1"><Filter size={14} className="text-slate-400"/><select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="text-xs p-1 border rounded bg-slate-50 outline-none max-w-[100px]"><option value="">All Classes</option>{grades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select></div></div><div className="flex flex-col gap-2 mb-4"><select value={grade} onChange={e => setGrade(e.target.value)} className="p-2 border rounded text-sm bg-white"><option value="">Select Grade</option>{grades.filter(g=>g.active).map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select><div className="flex gap-2"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Subject Name" className="flex-1 p-2 border rounded text-sm"/><button onClick={handleAdd} className="bg-purple-600 text-white p-2 rounded-lg"><Plus size={18} /></button></div></div><div className="flex-1 overflow-y-auto space-y-2 max-h-48 custom-scrollbar">{filteredSubjects.map((sub) => (<ListItem key={sub.id} item={sub} extraInfo={sub.grade} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />))}</div></div>);
};

const SectionMetadataEditor = ({ grades, subjects = [], sections = [], onAdd, onEdit, onToggle, onDelete }) => {
  const [grade, setGrade] = useState(''); const [subject, setSubject] = useState(''); const [name, setName] = useState('');
  const [filterGrade, setFilterGrade] = useState(''); const [filterSubject, setFilterSubject] = useState('');
  let visibleSections = sections; if (filterGrade) visibleSections = visibleSections.filter(s => s.grade === filterGrade); if (filterSubject) visibleSections = visibleSections.filter(s => s.subject === filterSubject);
  const rawSubjectList = filterGrade ? subjects.filter(s => s.grade === filterGrade) : subjects;
  const uniqueFilterSubjects = Array.from(new Set(rawSubjectList.map(s => s.name))).map(name => rawSubjectList.find(s => s.name === name));
  const handleAdd = () => { if (!grade || !subject || !name) return; onAdd({ name, grade, subject }); setName(''); };
  return (<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full"><div className="flex flex-col gap-2 mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><List size={18} className="text-green-500"/> Sections</h3><div className="flex gap-2"><select value={filterGrade} onChange={e => {setFilterGrade(e.target.value); setFilterSubject('');}} className="text-xs p-1 border rounded bg-slate-50 outline-none flex-1"><option value="">All Classes</option>{grades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select><select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="text-xs p-1 border rounded bg-slate-50 outline-none flex-1"><option value="">All Subjects</option>{uniqueFilterSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select></div></div><div className="flex flex-col gap-2 mb-4"><select value={grade} onChange={e => {setGrade(e.target.value); setSubject('');}} className="p-2 border rounded text-sm bg-white"><option value="">Select Grade</option>{grades.filter(g=>g.active).map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select><select value={subject} onChange={e => setSubject(e.target.value)} className="p-2 border rounded text-sm bg-white" disabled={!grade}><option value="">Select Subject</option>{subjects.filter(s=>s.grade===grade && s.active).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select><div className="flex gap-2"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Section Name" className="flex-1 p-2 border rounded text-sm"/><button onClick={handleAdd} className="bg-green-600 text-white p-2 rounded-lg"><Plus size={18} /></button></div></div><div className="flex-1 overflow-y-auto space-y-2 max-h-48 custom-scrollbar">{visibleSections.map((sec) => (<ListItem key={sec.id} item={sec} extraInfo={`${sec.grade} • ${sec.subject}`} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />))}</div></div>);
};


export default function SettingsPage() {
  const { token } = useAuth(); // Use the auth hook to get the token
  const [metadata, setMetadata] = useState({
    grades: [],
    subjects: [],
    sections: [],
    questionTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetadata = async () => {
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [grades, subjects, sections, questionTypes] = await Promise.all([
        apiGetMetadata('grades', token),
        apiGetMetadata('subjects', token),
        apiGetMetadata('sections', token),
        apiGetMetadata('questionTypes', token),
      ]);
      setMetadata({ grades, subjects, sections, questionTypes });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [token]);

  const handleUpdateMetadata = async (collectionName, action, data, itemId = null) => {
    if (!token) {
      setError('Authentication token not found.');
      return;
    }

    try {
        let currentList = [...(metadata[collectionName] || [])];

        if (action === 'add') {
            const newItem = { id: Date.now().toString(), active: true, ...data };
            currentList.push(newItem);
        } else if (action === 'remove') {
            currentList = currentList.filter(item => item.id !== itemId);
        } else if (action === 'edit') {
            currentList = currentList.map(item => item.id === itemId ? { ...item, name: data } : item);
        } else if (action === 'toggle') {
            currentList = currentList.map(item => item.id === itemId ? { ...item, active: !item.active } : item);
        }

        await apiUpdateMetadata(collectionName, currentList, token);
        // Refresh local state
        fetchMetadata();

    } catch (err: any) {
        setError(err.message || `Failed to update ${collectionName}`);
    }
};


  if (loading) return <div className="p-8">Loading settings...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-slate-600" /> Settings
        </h2>
      </header>
      <div className="grid md:grid-cols-2 gap-6" style={{height: '700px'}}>
        <SimpleMetadataEditor 
            title="Classes" 
            items={metadata.grades} 
            onAdd={d => handleUpdateMetadata('grades', 'add', d)} 
            onEdit={(id, v) => handleUpdateMetadata('grades', 'edit', v, id)} 
            onToggle={(id) => handleUpdateMetadata('grades', 'toggle', null, id)} 
            onDelete={(id) => handleUpdateMetadata('grades', 'remove', null, id)} 
            placeholder="Grade" 
        />
        <SimpleMetadataEditor 
            title="Question Types" 
            items={metadata.questionTypes} 
            onAdd={d => handleUpdateMetadata('questionTypes', 'add', d)} 
            onEdit={(id, v) => handleUpdateMetadata('questionTypes', 'edit', v, id)} 
            onToggle={(id) => handleUpdateMetadata('questionTypes', 'toggle', null, id)} 
            onDelete={(id) => handleUpdateMetadata('questionTypes', 'remove', null, id)} 
            placeholder="Question Type" 
        />
        <SubjectMetadataEditor 
            grades={metadata.grades} 
            subjects={metadata.subjects} 
            onAdd={d => handleUpdateMetadata('subjects', 'add', d)} 
            onEdit={(id, v) => handleUpdateMetadata('subjects', 'edit', v, id)} 
            onToggle={(id) => handleUpdateMetadata('subjects', 'toggle', null, id)} 
            onDelete={(id) => handleUpdateMetadata('subjects', 'remove', null, id)}
        />
        <SectionMetadataEditor 
            grades={metadata.grades} 
            subjects={metadata.subjects} 
            sections={metadata.sections}
            onAdd={d => handleUpdateMetadata('sections', 'add', d)}
            onEdit={(id, v) => handleUpdateMetadata('sections', 'edit', v, id)}
            onToggle={(id) => handleUpdateMetadata('sections', 'toggle', null, id)}
            onDelete={(id) => handleUpdateMetadata('sections', 'remove', null, id)}
        />
      </div>
    </div>
  );
}
