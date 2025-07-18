
import React from 'react';
/**
 * CustomerReviews component for conversion theme
 * Displays customer testimonials with star ratings and review cards
 * Features responsive grid layout with professional styling
 */
const CustomerReviews = () => {
  const reviews = [
    {
      name: "Sarah M.",
      rating: 5,
      review: "Amazing service! Got my prescription sorted in 10 minutes. The doctor was thorough and professional.",
      location: "Sydney, NSW"
    },
    {
      name: "James T.",
      rating: 5,
      review: "Perfect for busy professionals. No waiting rooms, no hassle. Will definitely use again.",
      location: "Melbourne, VIC"
    },
    {
      name: "Lisa K.",
      rating: 5,
      review: "Needed a medical certificate urgently and DocBook delivered. Great platform, easy to use.",
      location: "Brisbane, QLD"
    }
  ];
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-amber-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };
  return (
    <div id="CustomerReviews_v1" className="container mx-auto">
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real reviews from patients who trust DocBook for their healthcare needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex mb-4">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{review.review}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default CustomerReviews;
