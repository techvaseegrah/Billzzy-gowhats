import Link from "next/link";
import { useState } from "react";
import React from 'react';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <>
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-2">
              <img
                src="/image5.png"
                alt=""
                width={38}
                className="cursor-pointer"
                onClick={handleScrollToTop}
              />
              <span
                className="text-2xl font-bold text-gray-900 cursor-pointer"
                onClick={handleScrollToTop}
              >
                Billzzy
              </span>
            </div>
            <div className="flex gap-4">
            <Link href="/login">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors "
              >
                Login
              </button>
              </Link>
              <Link href="/register">
              <button
                onClick={() => setShowRegister(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </button>
              </Link>

            </div>
          </div>
        </div>
      </nav>


    </>
  );
}
