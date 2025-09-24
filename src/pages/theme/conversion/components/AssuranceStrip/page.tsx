import AssuranceStrip from '../../../../../components/theme/conversion/components/AssuranceStrip/figmaToCode';
import AssuranceStripComponentPage from './pages/theme/conversion/components/AssuranceStrip/page';

/**
 * AssuranceStrip Page - Displays the AssuranceStrip in isolation
 */
export default function AssuranceStripPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Original Lovable Component</h1>
      
      <AssuranceStrip />
      
      <h3 className="text-xl font-semibold mt-6 mb-4">Original Screenshot</h3>
      <img 
        src="https://pub-8d68c3d7563546ce99e590c87ad44d51.r2.dev/1757472031790_3ykrcs8bm.png" 
        alt="Original Screenshot" 
        className="w-full max-w-4xl mx-auto shadow-lg rounded-lg"
      />
    </div>
  );
}