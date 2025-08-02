import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion"; // Import Framer Motion

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechStart",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    content:
      "Billzzy has transformed how we handle our billing process. The automation features alone have saved us countless hours.",
  },
  {
    name: "Michael Chen",
    role: "Founder of GrowthLabs",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    content:
      "The best billing software we have ever used. The interface is intuitive and the customer support is outstanding.",
  },
  {
    name: "Emma Davis",
    role: "CFO at CloudScale",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    content:
      "Since implementing Billzzy, we have reduced our billing processing time by 75%. It has been a game-changer.",
  },
  {
    name: "John Doe",
    role: "CEO at TechStart",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    content:
      "Billzzy has been a game-changer for our billing process. It has simplified our workflow and saved us countless hours.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => {
    setCurrent(
      (curr) => (curr - 1 + testimonials.length) % testimonials.length
    );
  };

  const next = () => {
    setCurrent((curr) => (curr + 1) % testimonials.length);
  };

  return (
    <div id="blog" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by industry leaders
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say about Billzzy
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
              key={current}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-gray-50 p-8 rounded-xl max-w-2xl mx-auto">
                    <motion.div
                      className="flex gap-1 mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-current text-yellow-400"
                        />
                      ))}
                    </motion.div>
                    <p className="text-gray-700 mb-6 text-lg">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
