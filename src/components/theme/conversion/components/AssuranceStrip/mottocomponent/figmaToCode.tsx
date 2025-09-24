
/**
 * MottoComponent - A hero section component with bold typography
 * Displays a motivational motto with dark background and large text
 * Features two-color text treatment with white and amber colors
 */
export default function MottoComponent() {
  return (
    <div id="mottocomponent">
      <div 
        data-layer="MottoComponent [Component 3][Desktop]" 
        className="w-full max-w-[1920px] h-64 relative mx-auto"
      >
        <div 
          data-layer="Background" 
          className="w-full h-64 bg-zinc-800" 
        />
        <div 
          data-layer="All new technologies. No apologies." 
          className="absolute inset-0 flex items-center justify-center px-4"
        >
          <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold font-Urbanist text-center leading-tight max-w-4xl">
            All new technologies. No apologies.
          </div>
        </div>
      </div>
    </div>
  );
}
