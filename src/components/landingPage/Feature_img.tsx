import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const OurFeature = [
  {
    feature: "Order Confirmation Automation",
    content:
      "Instantly confirm orders and reduce errors with automated confirmations.",
    image: "/assets/message.png",
  },
  {
    feature: "Automatic Amount Confirmation",
    content:
      "Automatically verify amounts to avoid discrepancies and manual checks.",
    image: "/assets/payment.png",
  },
  {
    feature: "Automated Address Entry",
    content:
      "Save time with smart address detection and auto-fill capabilities.",
    image: "/assets/address.png",
  },
  {
    feature: "Shipping Partner Integration",
    content: "Automatically sync with shipping partners for seamless delivery.",
    image: "/assets/shipping.png",
  },
];

export default function FeatureImage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % OurFeature.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => {
    setCurrent((curr) => (curr - 1 + OurFeature.length) % OurFeature.length);
  };

  const next = () => {
    setCurrent((curr) => (curr + 1) % OurFeature.length);
  };

  return (
    <div id="blog" className="bg-white py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 ">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Special Features
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the unique features that make us stand out.
          </motion.p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${current * 100}%)` }}
              key={current}
            >
              {OurFeature.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`w-full flex-shrink-0 px-2 sm:px-4 ${
                    index === current ? "scale-105" : "scale-100"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                >
                  <div
                    className="p-4 sm:p-8 rounded-xl max-w-3xl mx-auto"
                    style={{ minHeight: "400px sm:minHeight:600px" }}
                  >
                    <motion.h3
                      className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {feature.feature}
                    </motion.h3>
                    <motion.div
                      className="flex justify-center items-center sm:mt-12 mb-5 sm:mx-8"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "tween", duration: 0.2 }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.feature}
                        className="w-full h-[400px] sm:h-[560px] object-contain "
                      />
                    </motion.div>
                    <motion.p
                      className="text-[#1d4ed8] text-center text-base sm:text-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {feature.content}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 sm:p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.button>

          <motion.button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 sm:p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
