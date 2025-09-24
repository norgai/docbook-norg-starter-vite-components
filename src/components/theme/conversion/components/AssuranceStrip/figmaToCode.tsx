import { useState, useEffect } from 'react';
import { Star, Shield, Lock, Truck } from 'lucide-react';

const AssuranceStrip = () => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setSticky(heroBottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className={`bg-white py-3 shadow-subtle ${
        sticky ? 'sticky top-14 z-30 animate-fade-in' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-docindigo">
          <div className="flex items-center">
            <Star size={16} className="mr-1.5 text-docamber" fill="currentColor" />
            <span className="font-medium">4.8/5 from 3,200+ Aussies</span>
          </div>
          <div className="flex items-center">
            <Shield size={16} className="mr-1.5 text-docteal" />
            <span>100% AHPRA doctors</span>
          </div>
          <div className="flex items-center">
            <Lock size={16} className="mr-1.5 text-docteal" />
            <span>HIPAA-grade encryption</span>
          </div>
          <div className="flex items-center">
            <Truck size={16} className="mr-1.5 text-docteal" />
            <span>Free AusPost Express</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssuranceStrip;