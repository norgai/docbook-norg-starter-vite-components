
import React from 'react';

/**
 * MembershipBenefits component for conversion theme
 * Displays healthcare platform benefits in a grid layout
 * Features icons, titles, and descriptions for each benefit
 */
const MembershipBenefits = () => {
  const benefits = [
    {
      title: "24/7 Doctor Access",
      description: "Connect with Australian doctors anytime, anywhere",
      icon: "🕐"
    },
    {
      title: "Instant Prescriptions",
      description: "Get e-prescriptions sent directly to your pharmacy",
      icon: "💊"
    },
    {
      title: "Medical Certificates",
      description: "Valid medical certificates for work or school",
      icon: "📋"
    },
    {
      title: "Secure Platform",
      description: "Your health information is protected and private",
      icon: "🔒"
    },
    {
      title: "No Wait Times",
      description: "Skip the waiting room and see a doctor immediately",
      icon: "⏰"
    },
    {
      title: "Follow-up Care",
      description: "Ongoing support and care for your health needs",
      icon: "🔄"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose DocBook?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of healthcare with our comprehensive telehealth platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipBenefits;
