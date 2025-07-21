import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        {/* Left: Logo / Text */}
        <div className="mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </div>

        {/* Right: Links */}
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
          <Link href="/terms" className="hover:text-blue-600">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
