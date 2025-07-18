
import MembershipBenefits from '../../../../../components/theme/conversion/components/MembershipBenefits/lovableToCode_v1';

/**
 * MembershipBenefits Component Page - Displays the MembershipBenefits component in isolation
 */
export default function MembershipBenefitsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Component Name Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MembershipBenefits</h1>
        
        {/* Component Render */}
        <div className="mb-12">
          <MembershipBenefits />
        </div>
        
        {/* Design Reference Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Design Reference Screenshot</h2>
          <img 
            src="/components/MembershipBenefits/ai_knowledge/desktop_design_v1.png" 
            alt="MembershipBenefits Design Reference" 
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
