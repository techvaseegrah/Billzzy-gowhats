import { ArrowRight, CheckCircle, Link } from "lucide-react";
import LottieAnimation from "./LottieAnimation";

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white min-h-screen flex items-center pt-20 sm:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Title, Buttons, and Features */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Empowering Your Sales, Simplifying Your Workflow
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Streamline your billing process and boost productivity with automated address entry
              and smart order management.
            </p>
            <div className="flex flex-wrap gap-4">
              <>
              <a href="https://billzzy.com/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Get Started <ArrowRight className="w-5 h-5" />
              </a>
              </>

                <a href="#usecase" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">Learn More</a>
            </div>
            <div className="mt-8 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-300" />
                <span>No Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-300" />
                <span>Free Support</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Responsive Video */}
          <div className="flex justify-center">
            <LottieAnimation/>
          </div>
        </div>
      </div>
    </div>
  );
}
