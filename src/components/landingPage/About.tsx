import { Target, Users, Heart } from 'lucide-react';

export default function About() {
  return (
    <div id='about' className="py-24 bg-white-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Billzzy</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're on a mission to simplify billing for businesses worldwide
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To provide the most efficient and user-friendly billing solution for businesses of all sizes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Team</h3>
            <p className="text-gray-600">
              A dedicated group of professionals committed to revolutionizing the billing industry.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Values</h3>
            <p className="text-gray-600">
              Innovation, integrity, and customer satisfaction are at the heart of everything we do.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}