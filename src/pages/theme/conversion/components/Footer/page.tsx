
import Footer from '../../../../../components/theme/conversion/components/Footer/lovableToCode_v1';

/**
 * Footer Component Page - Displays the Footer component in isolation
 */
export default function FooterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Component Name Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Footer</h1>
        
        {/* Component Render */}
        <div className="mb-12">
          <Footer />
        </div>
        
        {/* Design Reference Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Design Reference Screenshot</h2>
          <img 
            src="/components/Footer/ai_knowledge/desktop_design_v1.png" 
            alt="Footer Design Reference" 
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
