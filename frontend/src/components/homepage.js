// Frontend/src/components/homepage.js
import React from 'react';
import { Lightbulb } from "lucide-react";

const Homepage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Lightbulb className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
              Recommender System
            </h1>
          </div>

          {/* Buttons with hover effects */}
          <div className="flex justify-center sm:justify-end gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('login')}
              className="text-indigo-600 px-5 py-2 rounded-lg font-semibold border border-indigo-100 hover:bg-indigo-50 hover:shadow-md hover:scale-105 transition-transform duration-300 text-sm sm:text-base"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 hover:shadow-lg hover:scale-105 transition-transform duration-300 text-sm sm:text-base"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 sm:p-6 rounded-full shadow-xl">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-snug px-2">
            Smart Recommendations,
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Personalized Learning!!
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto px-2">
            Get personalized recommendations through intelligent conversations.
            Our AI-powered system understands your preferences and suggests
            exactly what you need.
          </p>

          <button
            onClick={() => onNavigate('signup')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:shadow-lg hover:scale-105 transform transition duration-300"
          >
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: 'AI-Powered',
              color: 'indigo',
              desc: 'Advanced machine learning algorithms analyze your preferences to provide accurate and relevant recommendations tailored just for you.',
              iconPath:
                'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
            },
            {
              title: 'Personalized',
              color: 'indigo',
              desc: 'Every recommendation is customized based on your unique preferences, history, and real-time interactions with our system.',
              iconPath:
                'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            },
            {
              title: 'Secure & Private',
              color: 'indigo',
              desc: 'Your data is encrypted and protected. We prioritize your privacy and ensure your information remains confidential and secure.',
              iconPath:
                'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition duration-300 text-center sm:text-left group"
            >
              <div
                className={`bg-${feature.color}-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition`}
              >
                <svg
                  className={`w-7 h-7 sm:w-8 sm:h-8 text-${feature.color}-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={feature.iconPath}
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 hover:bg-indigo-50 transform transition duration-300 cursor-pointer"
              >
                <div className="bg-indigo-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg sm:text-xl font-bold">
                  {step}
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-2">
                  {step === 1
                    ? 'Sign Up'
                    : step === 2
                    ? 'Chat'
                    : step === 3
                    ? 'Get Recommendations'
                    : 'Enjoy'}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {step === 1
                    ? 'Create your free account in seconds'
                    : step === 2
                    ? "Tell us what you're looking for"
                    : step === 3
                    ? 'Receive personalized suggestions'
                    : 'Discover exactly what you need'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © 2025 Personalized Learning Path Recommender System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
