
import React, { useState } from 'react';
import HeroBanner from '../../../../../components/theme/conversion/components/HeroBanner/lovableToCode_v1';

/**
 * HeroBanner Component Page - Displays the HeroBanner component in isolation
 */
export default function HeroBannerPage() {
  const [chatOpen, setChatOpen] = useState(false);

  const handleTryAgain = async () => {
    try {
      await fetch('/api/regenerate/HeroBanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentName: 'HeroBanner',
          timestamp: new Date().toISOString()
        })
      });
      alert('Re-running Figma to Code process for HeroBanner component');
    } catch (error) {
      console.error('Error triggering regeneration:', error);
      alert('Error triggering regeneration. Please try again.');
    }
  };

  const handleChat = () => {
    setChatOpen(true);
  };

  const closeChatWindow = () => {
    setChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HeroBanner</h1>
          <div className="flex gap-3">
            <button
              onClick={handleTryAgain}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <button
              onClick={handleChat}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </button>
          </div>
        </div>

        {/* Component Render */}
        <div className="mb-12">
          <HeroBanner />
        </div>

        {/* Design Reference Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Design Reference Screenshot</h2>
          <img 
            src="/components/HeroBanner/ai_knowledge/desktop_design_v1.png" 
            alt="HeroBanner Design Reference" 
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>

        {/* Chat Window Modal */}
        {chatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-96">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chat about HeroBanner
                </h3>
                <button
                  onClick={closeChatWindow}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      Hi! I'm here to help you with the HeroBanner component. What would you like to know or change?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
