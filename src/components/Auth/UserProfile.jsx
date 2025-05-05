import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLogOut } from 'react-icons/fi';

import './auth.css';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://darisni.onrender.com/profile', {
          withCredentials: true
        });

        if (res.data.email && res.data.name) {
          setUserData(res.data);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const res = await axios.post('https://darisni.onrender.com/log_out');
      if (res.data.success) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6
        transition-all duration-300 hover:shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-500">Manage your account details</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl ${message.includes('failed') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}

        {userData && (
          <div className="space-y-6">
            <div className="relative">
              <FiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <div className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{userData.name}</p>
              </div>
            </div>

            <div className="relative">
              <FiMail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <div className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700
                text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              Log Out
              <FiLogOut className="text-xl" />
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">
          Return to {' '}
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;