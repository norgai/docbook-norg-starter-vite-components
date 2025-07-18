
import FAQAccordion from '../../../../../components/theme/conversion/components/FAQAccordion/lovableToCode_v1';

/**
 * FAQAccordion Component Page - Displays the FAQAccordion component in isolation
 */
export default function FAQAccordionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Component Name Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">FAQAccordion</h1>
        
        {/* Component Render */}
        <div className="mb-12">
          <FAQAccordion />
        </div>
        
        {/* Design Reference Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Design Reference Screenshot</h2>
          <img 
            src="/components/FAQAccordion/ai_knowledge/desktop_design_v1.png" 
            alt="FAQAccordion Design Reference" 
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
