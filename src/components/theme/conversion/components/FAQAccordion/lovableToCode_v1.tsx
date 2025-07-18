
import React, { useState } from 'react';
/**
 * FAQAccordion component for conversion theme
 * Displays a collapsible FAQ section with healthcare-related questions
 * Features smooth animations and professional styling
 */
const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: "How quickly can I see a doctor?",
      answer: "You can typically see a doctor within minutes of booking. Our platform connects you with available Australian GPs 24/7."
    },
    {
      question: "Are the doctors qualified?",
      answer: "Yes, all our doctors are AHPRA-registered Australian medical practitioners with full qualifications and experience."
    },
    {
      question: "Can I get prescriptions online?",
      answer: "Yes, our doctors can prescribe medications and send e-prescriptions directly to your chosen pharmacy."
    },
    {
      question: "What about medical certificates?",
      answer: "Our doctors can issue valid medical certificates for work, school, or other requirements during your consultation."
    },
    {
      question: "Is my information secure?",
      answer: "Absolutely. We use bank-level encryption and comply with all Australian privacy laws to protect your health information."
    },
    {
      question: "Do you accept Medicare?",
      answer: "Currently, we operate on a private pay model. However, you may be able to claim some costs back through your private health insurance."
    }
  ];
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div id="FAQAccordion_v1" className="container mx-auto">
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our telehealth services
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  className="w-full text-left bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {faq.question}
                    </h3>
                    <span className="text-teal-600 text-xl">
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </div>
                  {openIndex === index && (
                    <div className="mt-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default FAQAccordion;
