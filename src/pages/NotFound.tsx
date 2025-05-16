import { Link } from 'react-router-dom';

/**
 * NotFound page component
 * Displayed when a route doesn't match any defined routes
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-12">
      <div className="mb-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-primary-200"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      </div>
      
      <h1 className="text-7xl font-bold text-primary-600 mb-2">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      
      <p className="max-w-md text-gray-600 mb-8 text-lg">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
        <Link to="/" className="btn btn-primary px-8 py-3 text-base">
          Go back home
        </Link>
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-secondary px-8 py-3 text-base"
        >
          Go back
        </button>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100 max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Looking for something?</h3>
        <p className="text-gray-600 mb-4">
          Try navigating using the links in the header or contact support if you can't find what you need.
        </p>
        <a 
          href="mailto:support@example.com" 
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Contact Support →
        </a>
      </div>
    </div>
  );
}