
import React from 'react';
import { Link } from 'react-router-dom';
/**
 * CareOptions component for conversion theme
 * Displays healthcare service options in a grid layout with icons and descriptions
 * Features hover effects and navigation links to different care services
 */
const CareOptions = () => {
  const options = [
    {
      title: "Online Doctor",
      description: "Video or text consultations with Australian GPs",
      icon: "💻",
      link: "/online-doctor"
    },
    {
      title: "Medical Certificates",
      description: "Valid medical certificates issued online",
      icon: "📄",
      link: "/medical-certificates"
    },
    {
      title: "Pathology Referrals",
      description: "Get pathology referrals without leaving home",
      icon: "🔬",
      link: "/pathology"
    },
    {
      title: "Urgent Virtual Care",
      description: "24/7 urgent care consultations",
      icon: "🚨",
      link: "/urgent-virtual-care"
    }
  ];
  return (
    <div id="CareOptions_v1" className="container mx-auto">
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Healthcare When You Need It
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the care option that works best for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {options.map((option, index) => (
              <Link
                key={index}
                to={option.link}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {option.title}
                </h3>
                <p className="text-gray-600">
                  {option.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default CareOptions;
