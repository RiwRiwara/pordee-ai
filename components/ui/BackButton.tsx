"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ href, label, className = "" }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      aria-label="Go back"
      className={`${className} flex items-center justify-center`}
      isIconOnly={!label}
      variant="light"
      onPress={handleBack}
    >
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
          fillRule="evenodd"
        />
      </svg>
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
};

export default BackButton;
