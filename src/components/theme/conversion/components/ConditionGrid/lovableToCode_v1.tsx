
import React from 'react';
import { Link } from 'react-router-dom';
/**
 * ConditionGrid component for conversion theme
 * Displays a grid of common medical conditions that can be treated
 * Features hover effects and organized layout with icons and treatment links
 */
const ConditionGrid = () => {
  const conditions = [
    { name: "UTI Treatment", link: "/uti-treatment", icon: "🦠" },
    { name: "Hair Loss", link: "/hair-loss-treatment", icon: "💇" },
    { name: "Birth Control", link: "/birth-control-pills", icon: "💊" },
    { name: "Acne Treatment", link: "/acne-treatment", icon: "🧴" },
    { name: "Anxiety", link: "/anxiety-treatment", icon: "🧘" },
    { name: "Cold Sores", link: "/cold-sore-treatment", icon: "💋" },
    { name: "Eczema", link: "/eczema-treatment", icon: "🤲" },
    { name: "ED Treatment", link: "/ed-treatment", icon: "💙" },
    { name: "Asthma", link: "/asthma-treatment", icon: "🫁" },
    { name: "Depression", link: "/depression-treatment", icon: "💚" },
    { name: "Sinus Infection", link: "/sinus-infection-treatment", icon: "👃" },
    { name: "COVID-19", link: "/covid-19-treatment", icon: "😷" }
  ];
  return (
    <div id="ConditionGrid_v1" className="container mx-auto">
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Common Conditions We Treat
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get expert treatment for a wide range of conditions from qualified Australian doctors
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conditions.map((condition, index) => (
              <Link
                key={index}
                to={condition.link}
                className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-300 group border border-gray-200"
              >
                <div className="text-2xl mb-2">{condition.icon}</div>
                <h3 className="text-sm font-medium text-slate-900 group-hover:text-teal-600 transition-colors">
                  {condition.name}
                </h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/treatments"
              className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              View All Treatments
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ConditionGrid;
