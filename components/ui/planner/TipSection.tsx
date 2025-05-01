import React, { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";

interface Tip {
  id: number;
  title: string;
  description: string;
}

export default function TipSection() {
  // Sample tips data
  const tips: Tip[] = [
    {
      id: 1,
      title: "Pordee Tips",
      description: "ถ้าเดือนนี้ โปะเพิ่มอีก 1,000 บาท คุณจะลดดอกเบี้ยรวมได้อีก 250 บาท เลยนะ!"
    },
    {
      id: 2,
      title: "Pordee Tips",
      description: "การชำระเงินเกินขั้นต่ำ 20% ช่วยลดระยะเวลาการชำระหนี้ได้ถึง 30%"
    },
    {
      id: 3,
      title: "Pordee Tips",
      description: "หากคุณมีหนี้หลายก้อน ให้จ่ายหนี้ที่มีดอกเบี้ยสูงสุดก่อนเสมอ"
    }
  ];

  // State for current tip index
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Auto cycle through tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [tips.length]);

  const currentTip = tips[currentTipIndex];

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Light bulb icon with blue background */}
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <FiInfo size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{currentTip.title}</h3>
            <p className="text-gray-700 text-sm">{currentTip.description}</p>
          </div>
        </div>
        
        {/* Tip navigation dots */}
        <div className="flex justify-center mt-3">
          {tips.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentTipIndex(index)}
              className={`w-2 h-2 mx-1 rounded-full ${index === currentTipIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
              aria-label={`Tip ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
