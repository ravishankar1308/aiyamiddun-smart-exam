// frontend/src/app/dashboard/questions/edit/[id]/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Upload,
  Check,
  X,
  Circle,
  CheckCircle,
  Square,
  CheckSquare,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiGetQuestion, apiUpdateQuestion, apiGetAllMetadata } from '@/lib/api';

const initialManualState = {
  text: '',
  answer: '',
  category: 'MCQ',
  difficulty_id: '',
  subject_id: '',
  grade_id: '',
  section_id: '',
  marks: '',
  answerDetail: '',
  imageUrl: '',
  options: ['', '', '', ''],
  disabled: false,
};

export default function EditQuestionPage() {
  const [question, setQuestion] = useState(initialManualState);
  const [metadata, setMetadata] = useState({ grades: [], subjects: [], sections: [], questionTypes: [], difficulties: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const allMetadata = await apiGetAllMetadata();
        setMetadata(allMetadata);
      } catch (err) {
        setError("Failed to load metadata.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestionAndMeta = async () => {
      try {
        setLoading(true);
        const [questionData, allMetadata] = await Promise.all([
          apiGetQuestion(id),
          apiGetAllMetadata(),
        ]);
        setQuestion(questionData);
        setMetadata(allMetadata);
      } catch (err) {
        setError("Failed to load question or metadata.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id === 'new') {
      fetchMetadata();
    } else if (id) {
      fetchQuestionAndMeta();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!question.text || !question.grade_id || !question.subject_id) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiUpdateQuestion(id, question);
      alert('Question updated successfully!');
      router.push('/dashboard/questions');
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
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
        setQuestion({ ...question, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const handleCorrectOptionSelect = (optionText, isMultiple) => {
    if (isMultiple) {
      const currentAns = question.answer ? question.answer.split(',').map(s => s.trim()) : [];
      let newAns;
      if (currentAns.includes(optionText)) {
        newAns = currentAns.filter(a => a !== optionText);
      } else {
        newAns = [...currentAns, optionText];
      }
      setQuestion({ ...question, answer: newAns.join(', ') });
    } else {
      setQuestion({ ...question, answer: optionText });
    }
  };

  const isObjective = ['MCQ', 'Multiple Answer'].includes(question.category);
  const isMultipleAnswer = question.category === 'Multiple Answer';

  const availableSubjects = question.grade_id ? metadata.subjects.filter(s => s.grade_id === parseInt(question.grade_id)) : [];
  const availableSections = question.subject_id ? metadata.sections.filter(s => s.subject_id === parseInt(question.subject_id)) : [];

  if (loading && !question.text) return <div>Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <PenTool className="text-blue-600" /> Edit Question
        </h2>
        <p className="text-slate-500 mt-1">Update the details of the question below.</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Class / Grade</label>
            <select value={question.grade_id} onChange={e => setQuestion({ ...question, grade_id: e.target.value, subject_id: '', section_id: '' })} className="w-full p-2 border rounded text-sm bg-white outline-none">
              <option value="">Select Class</option>
              {metadata.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Subject</label>
            <select value={question.subject_id} onChange={e => setQuestion({ ...question, subject_id: e.target.value, section_id: '' })} className="w-full p-2 border rounded text-sm bg-white outline-none" disabled={!question.grade_id}>
              <option value="">Select Subject</option>
              {availableSubjects.map((s, i) => <option key={i} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Section</label>
            <select value={question.section_id} onChange={e => setQuestion({ ...question, section_id: e.target.value })} className="w-full p-2 border rounded text-sm bg-white outline-none" disabled={!question.subject_id}>
              <option value="">Select Section</option>
              {availableSections.map((s, i) => <option key={i} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Marks / Points</label>
            <input type="number" placeholder="e.g. 5" className="w-full p-2 border rounded text-sm" value={question.marks} onChange={e => setQuestion({ ...question, marks: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Question Type</label>
            <select value={question.category} onChange={(e) => setQuestion({ ...question, category: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="">Select Type</option>
                {metadata.questionTypes.map((t, i) => <option key={i} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
            <select value={question.difficulty_id} onChange={(e) => setQuestion({ ...question, difficulty_id: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
              <option value="">Select Difficulty</option>
              {metadata.difficulties.map((d, i) => <option key={i} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
          <textarea value={question.text} onChange={(e) => setQuestion({ ...question, text: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Type your question here..." />
          <div className="mt-2">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="flex items-center gap-4">
              <button onClick={() => fileInputRef.current.click()} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md flex items-center gap-2 border border-slate-300">
                <Upload size={16} />
                {question.imageUrl ? "Change Image" : "Upload Image"}
              </button>
              {question.imageUrl && <span className="text-xs text-green-600 flex items-center gap-1"><Check size={12} /> Image Attached</span>}
            </div>
          </div>
        </div>

        {isObjective && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-blue-800">Answer Options</h3>
              <button onClick={() => setQuestion({ ...question, options: [...question.options, ''] })} className="text-xs bg-blue-200 hover:bg-blue-300 text-blue-800 px-2 py-1 rounded">
                + Add Option
              </button>
            </div>
            <div className="space-y-2">
              {question.options.map((opt, idx) => {
                const isSelected = isMultipleAnswer
                  ? question.answer.includes(opt) && opt !== ''
                  : question.answer === opt && opt !== '';
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
                        const newOpts = question.options.filter((_, i) => i !== idx);
                        setQuestion({ ...question, options: newOpts });
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

        <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Answer Key</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Correct Answer</label>
                    <textarea 
                        value={question.answer} 
                        onChange={(e) => setQuestion({ ...question, answer: e.target.value })} 
                        className={`w-full p-3 border border-slate-300 rounded-lg outline-none min-h-[60px] font-mono text-sm ${isObjective ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} 
                        placeholder="The exact answer key..." 
                        readOnly={isObjective}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Answer Detail / Explanation</label>
                    <textarea 
                        value={question.answerDetail} 
                        onChange={(e) => setQuestion({ ...question, answerDetail: e.target.value })} 
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
          <button onClick={handleUpdate} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
