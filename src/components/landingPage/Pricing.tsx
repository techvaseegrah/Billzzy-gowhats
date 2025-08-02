import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "Up to 50 Bills/month",
      "Dashboard",
      "Inventory management",
      "Order status updation via SMS",
      "24/7 support",
    ],
  },
  {
    name: "Enterprise",
    price: 499,
    features: [
      "Unlimited Billing",
      "Dashboard",
      "Inventory management",
      "Order status updation via SMS",
      "24/7 support",
    ],
  },
];

export default function Pricing() {
  return (
    <div id="pricing" className="py-24 bg-white-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid md:grid-cols-2  gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2 hover:ring-8 hover:ring-blue-500"
                  : "bg-white text-gray-900 border border-gray-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-500"
              }`}
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-sm">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
