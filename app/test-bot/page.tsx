'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const Page = () => {
  const [formData, setFormData] = useState({
    course_id: '',
    query: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const apiResponse = await fetch('http://elevate-exams-backend.eu-north-1.elasticbeanstalk.com/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token 440c0a3838eea3665ccfc000f42f6850b2a6fc8d'
        },
        body: JSON.stringify({
          course_id: formData.course_id,
          query: formData.query,
        }),
      });

      const data = await apiResponse.json();
     
      if (!apiResponse.ok) {
        setError(data.error || data.detail || 'Request failed');
        setIsLoading(false);
        return;
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full mt-20 sm:mt-12 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-mid border-2 border-slate-300 p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Test Bot Query</h2>
            <p className="text-slate-600 text-sm">
              Enter course ID and query to test the API
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course ID Field */}
            <div>
              <label htmlFor="course_id" className="block text-sm font-semibold text-slate-700 mb-1">
                Course ID
              </label>
              <Input
                id="course_id"
                name="course_id"
                type="text"
                placeholder="Enter course ID (e.g., auth)"
                className="w-full bg-white rounded-mid border-slate-300"
                value={formData.course_id}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Query Field */}
            <div>
              <label htmlFor="query" className="block text-sm font-semibold text-slate-700 mb-1">
                Query
              </label>
              <textarea
                id="query"
                name="query"
                placeholder="Enter your query"
                className="w-full bg-white rounded-mid border-slate-300 border px-3 py-2 min-h-[100px] resize-y"
                value={formData.query}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-green-50 border border-green-200 rounded-mid p-3">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Response:</h3>
                <pre className="text-xs text-green-700 whitespace-pre-wrap overflow-auto max-h-96">
                  {response}
                </pre>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Query'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page

