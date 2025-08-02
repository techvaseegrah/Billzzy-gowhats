import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/image5.png" alt="" width={38} />
              <span className="text-2xl font-bold text-white">Billzzy</span>
            </div>
            <p className="text-gray-400">
              Simplifying billing for businesses worldwide with smart automation
              and powerful features.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Other Products and services</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  F3 Engine
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  Go Whats
                </a>
              </li>
              <li>
                <a
                  href="#enterprise"
                  className="hover:text-white transition-colors"
                >
                  Website Development
                </a>
              </li>
              <li>
                <a
                  href="#usecase"
                  className="hover:text-white transition-colors"
                >
                  Logo Design
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://techvaseegrah.com" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="https://techvaseegrah.com" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/BillzyHQ/"
                className="hover:text-blue-600 transition-colors"
              >
                <Facebook className="w-6 h-6 text-gray-400 hover:text-blue-600" />
              </a>
              <a
                href="https://x.com/techvaseegrah"
                className="hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-6 h-6 text-gray-400 hover:text-blue-400" />
              </a>
              <a
                href="https://instagram.com/techvaseegrah"
                className="hover:text-pink-600 transition-colors"
              >
                <Instagram className="w-6 h-6 text-gray-400 hover:text-pink-400" />
              </a>
              <a
                href="https://linkedin.com/techvaseegrah"
                className="hover:text-blue-700 transition-colors"
              >
                <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-700" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Billzzy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
