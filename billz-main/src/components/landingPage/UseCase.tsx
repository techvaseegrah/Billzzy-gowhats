import { Store, Briefcase, Home, Truck } from "lucide-react";

const useCases = [
  {
    icon: Store,
    title: "Retail",
    description:
      "Billz streamlines inventory management, billing, and customer tracking for retail businesses, with built-in SMS notifications to keep customers updated from order to delivery.",
    image: "/assets/retail.jpg",
  },
  {
    icon: Briefcase,
    title: "E-commerce",
    description:
      "Create professional online bills with tracking numbers, generate shipping labels, and automatically notify customers when orders are created, packed, and dispatched.",
    image: '/assets/wholesale.jpg',
  },
  {
    icon: Home,
    title: "Small Businesses",
    description:
      "Track sales, manage inventory, and analyze business performance through our comprehensive dashboard, helping small businesses make data-driven decisions.",
    image: "/assets/localservice1.jpg",
  },
  {
    icon: Truck,
    title: "Logistics & Delivery",
    description:
      "Integrate with courier services, generate tracking IDs, and provide automatic SMS updates to customers about their shipment status and delivery timeline.",
    image: "/assets/delivery.jpg",
  },
];
export default function UseCases() {
  return (
    <div id="usecase" className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Industry Use Cases
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Billzzy is adaptable to various industries, improving efficiency and
            simplifying operations.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <img
                  src={useCase.image}
                  alt={`${useCase.title} Example`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
