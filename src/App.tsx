import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { ComponentShowcase } from './pages/ComponentShowcase';
import MottoComponentPage from './pages/theme/conversion/components/mottocomponent/page';
import AssuranceStripComponentPage from './pages/theme/conversion/components/AssuranceStrip/page';
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
          <Route path="theme/conversion/components/AssuranceStrip" element={<AssuranceStripComponentPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;