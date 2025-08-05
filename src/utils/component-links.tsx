
import { Link } from 'react-router-dom';
export function renderLinks() {
  return <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
    <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical">
      <Link to="/theme/conversion/components/AssuranceStrip" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        AssuranceStrip
      </Link>
      <Link to="/theme/conversion/components/PromoBar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        PromoBar
      </Link>
      <Link to="/theme/conversion/components/Navbar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Navbar
      </Link>
      <Link to="/theme/conversion/components/HeroBanner" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        HeroBanner
      </Link>
      <Link to="/theme/conversion/components/CareOptions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        CareOptions
      </Link>
      <Link to="/theme/conversion/components/ConditionGrid" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        ConditionGrid
      </Link>
      <Link to="/theme/conversion/components/PayPerVisitFeatures" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        PayPerVisitFeatures
      </Link>
      <Link to="/theme/conversion/components/HowItWorks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        HowItWorks
      </Link>
      <Link to="/theme/conversion/components/MembershipBenefits" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        MembershipBenefits
      </Link>
      <Link to="/theme/conversion/components/FAQAccordion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        FAQAccordion
      </Link>
      <Link to="/theme/conversion/components/CustomerReviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        CustomerReviews
      </Link>
      <Link to="/theme/conversion/components/CTAStrip" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        CTAStrip
      </Link>
      <Link to="/theme/conversion/components/ComplianceBadges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        ComplianceBadges
      </Link>
      <Link to="/theme/conversion/components/ExitIntentModal" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        ExitIntentModal
      </Link>
      <Link to="/theme/conversion/components/Footer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Footer
      </Link>
      <Link to="/theme/conversion/components/mottocomponent" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Motto Component
      </Link>
      {/* <Link to="/theme/ata/components/experthelp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Expert Help
      </Link> */}
    </div>
  </div>;
}
