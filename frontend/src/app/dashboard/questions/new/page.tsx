// frontend/src/app/dashboard/questions/new/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Plus,
  Upload,
  Check,
  X,
  Circle,
  CheckCircle,
  Square,
  CheckSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiCreateQuestion, apiGetMetadata } from '@/lib/api';

const initialManualState = {
  text: '',
  answer: '',
  category: 'MCQ',
  difficulty: 'medium',
  subject: '',
  classLevel: '',
  section: '',
  marks: '',
  answerDetail: '',
  imageUrl: '',
  options: ['', '', '', ''],
  disabled: false,
};

export default function ManualEntryPage() {
  const [manualQ, setManualQ] = useState(initialManualState);
  const [metadata, setMetadata] = useState({ grades: [], subjects: [], sections: [], questionTypes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [grades, subjects, sections, questionTypes] = await Promise.all([
          apiGetMetadata('grades'),
          apiGetMetadata('subjects'),
          apiGetMetadata('sections'),
          apiGetMetadata('questionTypes'),
        ]);
        setMetadata({ grades, subjects, sections, questionTypes });
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMeta();
  }, []);

  const handleSaveManual = async () => {
    if (!manualQ.text || !manualQ.classLevel || !manualQ.subject || !manualQ.section) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiCreateQuestion(manualQ);
      alert('Question saved successfully!');
      router.push('/dashboard/questions');
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 800 * 1024) {
      alert("Image size should be less than 800KB");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualQ({ ...manualQ, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...manualQ.options];
    newOptions[index] = value;
    setManualQ({ ...manualQ, options: newOptions });
  };

  const handleCorrectOptionSelect = (optionText, isMultiple) => {
    if (isMultiple) {
      const currentAns = manualQ.answer ? manualQ.answer.split(',').map(s => s.trim()) : [];
      let newAns;
      if (currentAns.includes(optionText)) {
        newAns = currentAns.filter(a => a !== optionText);
      } else {
        newAns = [...currentAns, optionText];
      }
      setManualQ({ ...manualQ, answer: newAns.join(', ') });
    } else {
      setManualQ({ ...manualQ, answer: optionText });
    }
  };

  const isObjective = ['MCQ', 'Multiple Answer'].includes(manualQ.category);
  const isMultipleAnswer = manualQ.category === 'Multiple Answer';

  const activeGrades = metadata.grades.filter(g => g.active);
  const activeQTypes = metadata.questionTypes.filter(t => t.active);
  const manualAvailableSubjects = manualQ.classLevel ? metadata.subjects.filter(s => s.grade === manualQ.classLevel && s.active) : [];
  const manualAvailableSections = (manualQ.classLevel && manualQ.subject) ? metadata.sections.filter(s => s.grade === manualQ.classLevel && s.subject === manualQ.subject && s.active) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <PenTool className="text-blue-600" /> Manual Question Entry
        </h2>
        <p className="text-slate-500 mt-1">Create a new question by filling out the details below.</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        {/* --- First Row: Class, Subject, Section, Marks --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Class / Grade</label>
            <select value={manualQ.classLevel} onChange={e => setManualQ({ ...manualQ, classLevel: e.target.value, subject: '', section: '' })} className="w-full p-2 border rounded text-sm bg-white outline-none">
              <option value="">Select Class</option>
              {activeGrades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Subject</label>
            <select value={manualQ.subject} onChange={e => setManualQ({ ...manualQ, subject: e.target.value, section: '' })} className="w-full p-2 border rounded text-sm bg-white outline-none" disabled={!manualQ.classLevel}>
              <option value="">Select Subject</option>
              {manualAvailableSubjects.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Section</label>
            <select value={manualQ.section} onChange={e => setManualQ({ ...manualQ, section: e.target.value })} className="w-full p-2 border rounded text-sm bg-white outline-none" disabled={!manualQ.subject}>
              <option value="">Select Section</option>
              {manualAvailableSections.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Marks / Points</label>
            <input type="number" placeholder="e.g. 5" className="w-full p-2 border rounded text-sm" value={manualQ.marks} onChange={e => setManualQ({ ...manualQ, marks: e.target.value })} />
          </div>
        </div>

        {/* --- Second Row: Type and Difficulty --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Question Type</label>
            <select value={manualQ.category} onChange={(e) => setManualQ({ ...manualQ, category: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="">Select Type</option>
                {activeQTypes.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
            <select value={manualQ.difficulty} onChange={(e) => setManualQ({ ...manualQ, difficulty: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* --- Question Text and Image Upload --- */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
          <textarea value={manualQ.text} onChange={(e) => setManualQ({ ...manualQ, text: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Type your question here..." />
          <div className="mt-2">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="flex items-center gap-4">
              <button onClick={() => fileInputRef.current.click()} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md flex items-center gap-2 border border-slate-300">
                <Upload size={16} />
                {manualQ.imageUrl ? "Change Image" : "Upload Image"}
              </button>
              {manualQ.imageUrl && <span className="text-xs text-green-600 flex items-center gap-1"><Check size={12} /> Image Attached</span>}
            </div>
          </div>
        </div>

        {/* --- Options for Objective Questions --- */}
        {isObjective && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-blue-800">Answer Options</h3>
              <button onClick={() => setManualQ({ ...manualQ, options: [...manualQ.options, ''] })} className="text-xs bg-blue-200 hover:bg-blue-300 text-blue-800 px-2 py-1 rounded">
                + Add Option
              </button>
            </div>
            <div className="space-y-2">
              {manualQ.options.map((opt, idx) => {
                const isSelected = isMultipleAnswer
                  ? manualQ.answer.includes(opt) && opt !== ''
                  : manualQ.answer === opt && opt !== '';
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-bold w-4 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 p-2 border border-blue-200 rounded text-sm focus:border-blue-500 outline-none"
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      onClick={() => handleCorrectOptionSelect(opt, isMultipleAnswer)}
                      className={`p-2 rounded hover:bg-blue-100 ${isSelected ? 'text-green-600 bg-green-50 ring-1 ring-green-200' : 'text-slate-300'}`}
                      title="Mark as Correct Answer"
                      disabled={!opt}
                    >
                      {isMultipleAnswer ? (
                        isSelected ? <CheckSquare size={18} /> : <Square size={18} />
                      ) : (
                        isSelected ? <CheckCircle size={18} /> : <Circle size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const newOpts = manualQ.options.filter((_, i) => i !== idx);
                        setManualQ({ ...manualQ, options: newOpts });
                      }}
                      className="p-2 text-slate-300 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <CheckCircle size={12} /> Select the circle/box to mark the correct answer.
            </p>
          </div>
        )}

        {/* --- Answer Key --- */}
        <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Answer Key</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Correct Answer</label>
                    <textarea 
                        value={manualQ.answer} 
                        onChange={(e) => setManualQ({ ...manualQ, answer: e.target.value })} 
                        className={`w-full p-3 border border-slate-300 rounded-lg outline-none min-h-[60px] font-mono text-sm ${isObjective ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} 
                        placeholder="The exact answer key..." 
                        readOnly={isObjective}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Answer Detail / Explanation</label>
                    <textarea 
                        value={manualQ.answerDetail} 
                        onChange={(e) => setManualQ({ ...manualQ, answerDetail: e.target.value })} 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none min-h-[100px]" 
                        placeholder="Explain how to reach the solution..." 
                    />
                </div>
            </div>
        </div>

        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

        <div className="flex gap-3 pt-4">
          <button onClick={() => router.back()} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveManual} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
