
import React from 'react';

/**
 * PayPerVisitFeatures component for conversion theme
 * Displays pay-per-visit pricing features with icons and descriptions
 * Features transparent pricing, no subscription, instant access, and no hidden costs
 */
const PayPerVisitFeatures = () => {
  const features = [
    {
      title: "No Subscription Required",
      description: "Pay only when you need care - no monthly fees or commitments",
      icon: "💰"
    },
    {
      title: "Transparent Pricing",
      description: "Know exactly what you'll pay before you book - starting from $49",
      icon: "💎"
    },
    {
      title: "Instant Access",
      description: "See a doctor within minutes, not hours or days",
      icon: "⚡"
    },
    {
      title: "No Hidden Costs",
      description: "What you see is what you pay - no surprise billing",
      icon: "📊"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Fair Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Healthcare shouldn't be complicated or expensive. Pay per visit with no hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PayPerVisitFeatures;
