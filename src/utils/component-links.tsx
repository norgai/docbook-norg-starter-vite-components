import { Link } from 'react-router-dom';

export function renderLinks() {
  return <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
    <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical">
      <Link to="/theme/conversion/components/mottocomponent" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Motto Component
      </Link>
      {/* <Link to="/theme/ata/components/experthelp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
        Expert Help
      </Link> */}
    </div>
  </div>;
}