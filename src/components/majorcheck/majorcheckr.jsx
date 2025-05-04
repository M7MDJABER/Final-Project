import React, { useState ,useEffect  } from 'react';
import axios from 'axios';
import Majorcheck from './majorcheckcomponent';

const QuizMaker = () => {
  const [formData, setFormData] = useState({
    track: '',
    language: 'en',
    NumberOfQuestion: 15
  });
  const [questions, setQuestions] = useState([]);
  const [definition, setDefinition] = useState('');
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-questions', formData);
      setQuestions(response.data.questions || []);
      setDefinition(response.data.definition || '');
      setTopics(response.data.topics || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          🎓 Major Fit Checker 🎓
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter a Major (e.g., IT, Medical, Engineering)
          </label>
          <input
            type="text"
            name="track"
            value={formData.track}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Number of Questions (10-15)
            </label>
            <input
              type="number"
              name="NumberOfQuestion"
              min="10"
              max="15"
              value={formData.NumberOfQuestion}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? 'Generating...' : 'Check My Fit'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </form>

      {(definition || topics) && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2">🧾 About this Major:</h3>
          {definition && <p className="mb-4 text-gray-800">{definition}</p>}
          {topics && (
            <>
              <h4 className="font-semibold mb-1 text-blue-600">📚 Example Courses:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {topics.split(',').map((topic, idx) => (
                  <li key={idx}>{topic.trim()}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
          <Majorcheck questions={questions} />
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
