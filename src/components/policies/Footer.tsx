// components/Footer.tsx
import Link from 'next/link';
import React from 'react';  // Add this import

const Footer = () => {
  return (
    <footer className=" mt-auto sticky  bg-indigo-500 bottom-0 place-content-center w-[100%]">
      <div className="container mx-auto text-[14px] px-4 py-1">
        <div className="flex flex-wrap justify-center gap-6 text-white">
        <Link href="/dashboard" className="hover:text-indigo-200">
            Home
          </Link>
          <Link href="/about" className="hover:text-indigo-200">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-indigo-200">
            Contact
          </Link>
          <Link href="/shipping-policy" className="hover:text-indigo-200">
            Shipping Policy
          </Link>
          <Link href="/privacy-policy" className="hover:text-indigo-200">
            Privacy Policy
          </Link>
          <Link href="/return-refund" className="hover:text-indigo-200">
            Return & Refund
          </Link>
          <Link href="/terms-conditions" className="hover:text-indigo-200">
            Terms & Conditions
          </Link>
        </div>
        {/* <div className="text-center mt-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Billzzy. All rights reserved.
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;