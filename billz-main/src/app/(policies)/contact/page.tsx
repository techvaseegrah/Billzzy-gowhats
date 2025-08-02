// app/(policies)/contact/page.tsx
import React from 'react';  // Add this import

export default function ContactPage() {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-3">
              <p>
                <strong>Email:</strong><br />
                <a href="mailto:admin@techvaseegrah.com" className="text-indigo-600">
                admin@techvaseegrah.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong><br />
                +91 85240 89733
              </p>
              <p>
                <strong>Address:</strong><br />
                #9 Vijaya Nagar Srinivasapuram Post
                Thanjavur, TN 613009
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Business Hours</h3>
              <p>Monday - Saturday: 9:00 AM - 6:00 PM IST</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }