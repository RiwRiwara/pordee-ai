import React from "react";
import Image from "next/image";

export default function NewEarly() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center text-[#3776C1]">เร็วๆ นี้</h2>
      <div className="border-b-2 border-[#3776C1] w-40 mx-auto mb-4"></div>
      
      <div className="relative rounded-xl overflow-hidden">
        <Image 
          src="/adss.png" 
          alt="สินเชื่อเคหะ" 
          width={600} 
          height={300} 
          className="w-full h-auto"
        />
        

      </div>

    </div>
  );
}
