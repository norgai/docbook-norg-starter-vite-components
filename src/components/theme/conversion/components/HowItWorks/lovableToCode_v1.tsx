
import React from 'react';
/**
 * HowItWorks component for conversion theme
 * Displays a 3-step process for booking and receiving healthcare online
 * Features numbered steps with icons and descriptions
 */
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Book Your Appointment",
      description: "Choose your preferred time and tell us about your health concern",
      icon: "📅"
    },
    {
      number: "02",
      title: "Meet Your Doctor",
      description: "Connect via secure video call or text chat with an Australian GP",
      icon: "👨‍⚕️"
    },
    {
      number: "03",
      title: "Get Your Treatment",
      description: "Receive prescriptions, medical certificates, or referrals instantly",
      icon: "💊"
    }
  ];
  return (
    <div id="HowItWorks_v1" className="container mx-auto">
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting healthcare online is simple and secure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full text-xl font-bold mb-4">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default HowItWorks;
