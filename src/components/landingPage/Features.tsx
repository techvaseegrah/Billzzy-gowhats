import {
  ClipboardCheck,
  DollarSign,
  CheckCircle,
  Printer,
  Package,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion"; 

const features = [
  {
    icon: ClipboardCheck,
    title: "Automated Address Entry",
    description:
      "Save time with smart address detection and auto-fill capabilities.",
  },
  {
    icon: DollarSign,
    title: "Automatic Amount Confirmation",
    description:
      "Automatically verify amounts to avoid discrepancies and manual checks.",
  },
  {
    icon: CheckCircle,
    title: "Order Confirmation Automation",
    description:
      "Instantly confirm orders and reduce errors with automated confirmations.",
  },
  {
    icon: Printer,
    title: "Label Printing",
    description:
      "Seamlessly print labels for shipping and inventory management.",
  },
  {
    icon: Package,
    title: "Packing & Tracking Automation",
    description:
      "Automate packing and track orders in real-time for better inventory control.",
  },
  {
    icon: Smartphone,
    title: "Mobile Order Management",
    description:
      "Manage orders on-the-go with mobile compatibility for your business.",
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Key Features to Simplify Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features that automate manual tasks and boost efficiency.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                whileHover={{
                  scale: 1.05, 
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", 
                }} 
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
