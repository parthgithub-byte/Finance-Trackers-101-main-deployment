import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Login successful!');
        login(data.user_id);
        navigate('/profile');
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Signin Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (redirect) {
      navigate('/profile');
    }
  }, [redirect, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-300">
      <div className="bg-white bg-opacity-80 text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-lg">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md mt-2 text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md mt-2 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-orange-600 rounded-full text-white text-lg hover:bg-orange-700"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <p>Don't have an account? <Link to="/signup" className="text-orange-200 hover:underline">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
