import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Home page component
 * Main landing page of the application
 */
export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const features = [
    {
      title: 'React 19',
      description: 'A JavaScript library for building user interfaces with components and hooks.',
      icon: '⚛️'
    },
    {
      title: 'Tailwind CSS v4',
      description: 'A utility-first CSS framework for rapidly building custom designs without leaving your HTML.',
      icon: '🎨'
    },
    {
      title: 'TypeScript',
      description: 'A strongly typed programming language that builds on JavaScript, giving you better tooling.',
      icon: '🔷'
    },
    {
      title: 'Vite',
      description: 'A build tool that aims to provide a faster and leaner development experience for modern web projects.',
      icon: '⚡'
    },
    {
      title: 'React Router',
      description: 'Declarative routing for React applications with a simple API.',
      icon: '🧭'
    },
    {
      title: 'ESLint',
      description: 'A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.',
      icon: '✅'
    }
  ];
  
  return (
    <div className="flex flex-col items-center space-y-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Welcome to <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">My App</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A modern starter template using React, TypeScript, Vite, and Tailwind CSS v4.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/about" className="btn btn-primary px-6 py-3 text-base">
            Learn More
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary px-6 py-3 text-base"
          >
            View Source
          </a>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Built with Modern Technologies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`
                rounded-xl bg-white p-6 shadow-sm border border-gray-100
                transition-all duration-300 hover:shadow-md
                ${hoveredCard === index ? 'ring-2 ring-primary-300 transform -translate-y-1' : ''}
              `}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-2xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 md:p-10 text-white text-center mt-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          This template provides everything you need to build amazing web applications quickly and efficiently.
        </p>
        <button className="bg-white text-primary-700 hover:text-primary-800 font-medium py-3 px-8 rounded-lg transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}