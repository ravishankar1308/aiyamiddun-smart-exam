'use client';

import { useEffect, useState } from 'react';
import { apiGetResults, Result } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ResultsPage() {
  const { user, token } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiGetResults(token);
        setResults(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exam Results</h1>

      {loading ? (
        <div className="text-center">
          <p>Loading results...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No results found.</p>
        </div>
      ) : (
        <div className="shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  Exam Title
                </th>
                {user?.role !== 'student' && (
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                    Student Name
                  </th>
                )}
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  Score
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  Submitted At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {results.map((result) => (
                <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-5 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{result.exam_title}</p>
                  </td>
                  {user?.role !== 'student' && (
                    <td className="px-5 py-5 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{result.student_name}</p>
                    </td>
                  )}
                  <td className="px-5 py-5 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {result.score} / {result.total_marks}
                    </p>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(result.submitted_at).toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
