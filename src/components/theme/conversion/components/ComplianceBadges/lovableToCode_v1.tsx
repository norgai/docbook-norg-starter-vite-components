
import React from 'react';
/**
 * ComplianceBadges component for conversion theme
 * Displays trust indicators and compliance badges in a grid layout
 * Features professional icons and descriptions for healthcare compliance
 */
const ComplianceBadges = () => {
  const badges = [
    {
      name: "AHPRA Registered",
      description: "All doctors are registered with AHPRA",
      icon: "🏥"
    },
    {
      name: "Privacy Compliant",
      description: "Compliant with Australian Privacy Act",
      icon: "🔒"
    },
    {
      name: "Secure Platform",
      description: "Bank-level encryption and security",
      icon: "🛡️"
    },
    {
      name: "24/7 Support",
      description: "Round-the-clock customer support",
      icon: "📞"
    }
  ];
  return (
    <div id="ComplianceBadges_v1" className="container mx-auto">
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default ComplianceBadges;
