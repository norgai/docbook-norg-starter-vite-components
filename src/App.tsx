
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { ComponentShowcase } from './pages/ComponentShowcase';
import MottoComponentPage from './pages/theme/conversion/components/mottocomponent/page';
import NavbarPage from './pages/theme/conversion/components/Navbar/page';
import AssuranceStripPage from './pages/theme/conversion/components/AssuranceStrip/page';
import PromoBarPage from './pages/theme/conversion/components/PromoBar/page';
import HeroBannerPage from './pages/theme/conversion/components/HeroBanner/page';
import CareOptionsPage from './pages/theme/conversion/components/CareOptions/page';
import ConditionGridPage from './pages/theme/conversion/components/ConditionGrid/page';
import PayPerVisitFeaturesPage from './pages/theme/conversion/components/PayPerVisitFeatures/page';
import HowItWorksPage from './pages/theme/conversion/components/HowItWorks/page';
import MembershipBenefitsPage from './pages/theme/conversion/components/MembershipBenefits/page';
import FAQAccordionPage from './pages/theme/conversion/components/FAQAccordion/page';
import CustomerReviewsPage from './pages/theme/conversion/components/CustomerReviews/page';
import CTAStripPage from './pages/theme/conversion/components/CTAStrip/page';
import ComplianceBadgesPage from './pages/theme/conversion/components/ComplianceBadges/page';
import FooterPage from './pages/theme/conversion/components/Footer/page';
import ExitIntentModalPage from './pages/theme/conversion/components/ExitIntentModal/page';
import './index.css';

/**
 * Main App component
 * Sets up routing for the application using React Router
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="components" element={<ComponentShowcase />} />
          <Route path="components/:componentId" element={<ComponentShowcase />} />
          <Route path="components/category/:categoryId" element={<ComponentShowcase />} />
          <Route path="theme/conversion/components/mottocomponent" element={<MottoComponentPage />} />
          <Route path="theme/conversion/components/Navbar" element={<NavbarPage />} />
          <Route path="theme/conversion/components/AssuranceStrip" element={<AssuranceStripPage />} />
          <Route path="theme/conversion/components/PromoBar" element={<PromoBarPage />} />
          <Route path="theme/conversion/components/HeroBanner" element={<HeroBannerPage />} />
          <Route path="theme/conversion/components/CareOptions" element={<CareOptionsPage />} />
          <Route path="theme/conversion/components/ConditionGrid" element={<ConditionGridPage />} />
          <Route path="theme/conversion/components/PayPerVisitFeatures" element={<PayPerVisitFeaturesPage />} />
          <Route path="theme/conversion/components/HowItWorks" element={<HowItWorksPage />} />
          <Route path="theme/conversion/components/MembershipBenefits" element={<MembershipBenefitsPage />} />
          <Route path="theme/conversion/components/FAQAccordion" element={<FAQAccordionPage />} />
          <Route path="theme/conversion/components/CustomerReviews" element={<CustomerReviewsPage />} />
          <Route path="theme/conversion/components/CTAStrip" element={<CTAStripPage />} />
          <Route path="theme/conversion/components/ComplianceBadges" element={<ComplianceBadgesPage />} />
          <Route path="theme/conversion/components/Footer" element={<FooterPage />} />
          <Route path="theme/conversion/components/ExitIntentModal" element={<ExitIntentModalPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
