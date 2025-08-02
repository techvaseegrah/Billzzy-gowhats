import Lottie from "lottie-react";
import animationData from "../../../public/Animation.json"; // Adjust the path as needed

export default function LottieAnimation() {
  return (
    <div className="flex justify-center items-center h-full">
      <Lottie 
        animationData={animationData} 
        loop={true} 
        style={{ width: "100%", maxWidth: "600px", height: "auto" }}
      />
    </div>
  );
}
