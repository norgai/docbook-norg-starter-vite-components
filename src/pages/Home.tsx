import { Link, useNavigate } from 'react-router-dom';

/**
 * Home page component displaying responsive tiles for all conversion theme components
 * Features component thumbnails, names, links, and interactive buttons
 */
export default function Home() {
  const navigate = useNavigate();

  // Component data for the conversion theme
  const components = [
    {
      id: 'motto-component',
      name: 'MottoComponent',
      displayName: 'Motto Component',
      path: '/components/motto-component',
      thumbnail: '/components/mottocomponent/ai_knowledge/desktop_design_v1.png',
      similarityScore: 0.94
    },
    {
      id: 'assurancestrip-component',
      name: 'AssuranceStripComponent',
      displayName: 'AssuranceStrip Component',
      path: '/theme/conversion/components/AssuranceStrip',
      thumbnail: 'https://pub-8d68c3d7563546ce99e590c87ad44d51.r2.dev/1757472031790_3ykrcs8bm.png',
      similarityScore: 0
    }
  ];

  const handleTryAgain = async (componentName: string) => {
    try {
      await fetch('/api/regenerate/' + componentName, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentName,
          timestamp: new Date().toISOString()
        })
      });
      alert(`Re-running Figma to Code process for ${componentName} component`);
    } catch (error) {
      console.error('Error triggering regeneration:', error);
      alert('Error triggering regeneration. Please try again.');
    }
  };

  const handleChat = (componentName: string) => {
    navigate(`/components/${componentName}?tab=chat`);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.8) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conversion Theme Components
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of conversion-focused components for healthcare platforms.
            Each component has been generated using AI and is ready for customization.
          </p>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {components.map((component) => (
            <div
              key={component.name}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={component.thumbnail}
                  alt={`${component.displayName} Preview`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-component.png';
                  }}
                />
                {/* Similarity Score Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(component.similarityScore)}`}>
                    {Math.round(component.similarityScore * 100)}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {component.displayName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Component: {component.name}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    to={component.path}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View Component
                  </Link>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTryAgain(component.name)}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                    
                    <button
                      onClick={() => handleChat(component.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{components.length}</div>
              <div className="text-sm text-gray-600">Total Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(components.reduce((sum, c) => sum + c.similarityScore, 0) / components.length * 100)}%
              </div>
              <div className="text-sm text-gray-600">Avg Similarity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {components.filter(c => c.similarityScore >= 0.9).length}
              </div>
              <div className="text-sm text-gray-600">High Quality (90%+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-gray-600">Theme</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}