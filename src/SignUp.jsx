import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('✅ Sign up successful!');
        // You can also redirect to Sign In page:
        window.location.href = '/signin';
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      alert('An error occurred. Please try again.');
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-600 via-pink-700 to-yellow-500">
      <div className="bg-white bg-opacity-90 text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-lg">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded-md mt-2 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-orange-600 rounded-full text-white text-lg hover:bg-orange-700"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p>Already have an account? <Link to="/signin" className="text-orange-200 hover:underline">Sign In</Link> </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
