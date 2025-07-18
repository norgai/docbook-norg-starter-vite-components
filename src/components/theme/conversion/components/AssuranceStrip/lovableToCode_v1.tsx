
import React from 'react';
/**
 * AssuranceStrip component for conversion theme
 * Displays trust indicators and key benefits in a horizontal strip
 * Features checkmark icons and professional messaging
 */
const AssuranceStrip = () => {
  return (
    <div id="AssuranceStrip_v1" className="container mx-auto">
      <section className="bg-emerald-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">✓ AHPRA Registered Doctors</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">✓ Available 24/7</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">✓ Secure & Confidential</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">✓ Instant Scripts</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default AssuranceStrip;
