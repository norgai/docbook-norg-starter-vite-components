/**
 * About page component
 * Provides information about the application
 */
export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">
        {/* Header section */}
        <div className="border-b border-gray-200 pb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About This App</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            This is a modern web application that demonstrates the use of React, TypeScript, 
            Vite, Tailwind CSS v4, and React Router. It was created as a starter template 
            for building fast, responsive, and type-safe web applications.
          </p>
        </div>
        
        {/* Technologies section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technologies Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-primary-700 mb-4">Frontend</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">React 19</strong>
                    <p className="text-gray-600 mt-1">For building the user interface with function components and hooks</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">TypeScript</strong>
                    <p className="text-gray-600 mt-1">For static type checking and improved developer experience</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">Tailwind CSS v4</strong>
                    <p className="text-gray-600 mt-1">For utility-first styling with advanced features</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-primary-700 mb-4">Development Tools</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">Vite</strong>
                    <p className="text-gray-600 mt-1">For fast development and optimized builds</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">ESLint</strong>
                    <p className="text-gray-600 mt-1">For code quality and consistency</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <strong className="font-medium">React Router</strong>
                    <p className="text-gray-600 mt-1">For client-side routing and navigation</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="bg-primary-100 text-primary-700 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium">Fast Development</h3>
                  <p className="text-gray-600 text-sm">With HMR and optimized build pipeline</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="bg-primary-100 text-primary-700 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium">Type-Safe Code</h3>
                  <p className="text-gray-600 text-sm">With TypeScript and strict mode</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="bg-primary-100 text-primary-700 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium">Responsive Design</h3>
                  <p className="text-gray-600 text-sm">With Tailwind's mobile-first approach</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="bg-primary-100 text-primary-700 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium">Modern Styling</h3>
                  <p className="text-gray-600 text-sm">With Tailwind CSS v4's advanced features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}