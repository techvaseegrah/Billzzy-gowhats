// const brandsRow1 = [
//   {
//     name: "Asot",
//     logo: "/icons/ascot-hotel.svg",
//   },
//   {
//     name: "Google",
//     logo: "/icons/dario.svg",
//   },
//   {
//     name: "Apple",
//     logo: "/icons/olympia-hotel.svg",
//   },
//   {
//     name: "Amazon",
//     logo: "/icons/slieve-donard-hotel.svg",
//   },
//   {
//     name: "Facebook",
//     logo: "/icons/volga-hotel.svg",
//   },
//   {
//     name: "Netflix",
//     logo: "/icons/volga-tv-2.svg",
//   },
//   {
//     name: "Twitter",
//     logo: "/icons/aspect-development.svg",
//   },
// ];

// const brandsRow2 = [
//   {
//     name: "Microsoft",
//     logo: "/icons/cyoptics.svg",
//   },
//   {
//     name: "Google",
//     logo: "/icons/olympia-hotel.svg",
//   },
//   {
//     name: "Apple",
//     logo: "/icons/mobil-logo-1.svg",
//   },
//   {
//     name: "Amazon",
//     logo: "/icons/soma-development.svg",
//   },
//   {
//     name: "Facebook",
//     logo: "/icons/technicolor-sound.svg",
//   },
//   {
//     name: "Netflix",
//     logo: "/icons/technicolor-logo.svg",
//   },
//   {
//     name: "Twitter",
//     logo: "/icons/mk-sound.svg",
//   },
//   {
//     name: "Microsoft",
//     logo: "/icons/olympia-hotel.svg",
//   },
//   {
//     name: "Google",
//     logo: "/icons/slieve-donard-hotel.svg",
//   },
// ];

export default function Brands() {
  return (
    <div id="enterprise" className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 flex justify-center">
      <div className="relative group max-w-4xl w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 group-hover:block opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <video
            src="/assets/sample1.mp4"
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
          />
        </div>
      </div>
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Our Customers</h2>
        <div className="relative max-w-full mx-auto overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="flex animate-infinite-scroll space-x-8">
              {brandsRow1.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 w-24 h-24 p-4"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-all"
                  />
                </div>
              ))}
              {brandsRow1.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}-duplicate`}
                  className="flex-shrink-0 w-24 h-24 p-4"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden mt-8">
            <div className="flex animate-infinite-scroll-reverse space-x-8">
              {brandsRow2.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 w-24 h-24 p-4"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-all"
                  />
                </div>
              ))}
              {brandsRow2.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}-duplicate`}
                  className="flex-shrink-0 w-24 h-24 p-4"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
