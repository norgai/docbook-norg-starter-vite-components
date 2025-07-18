
import React from 'react';
/**
 * PromoBar component for conversion theme
 * Displays promotional message with discount offer
 * Features brand colors and centered text layout
 */
const PromoBar = () => {
  return (
    <div id="PromoBar_v1" className="container mx-auto">
      <section className="bg-yellow-400 text-blue-900 py-2">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm font-medium">
              🎉 New patients get 20% off their first consultation - Use code WELCOME20
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default PromoBar;
