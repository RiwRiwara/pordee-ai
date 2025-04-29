import { IBM_Plex_Sans_Thai, Noto_Sans_Thai, Prompt } from "next/font/google";

// Primary font - IBM Plex Sans Thai for both Latin and Thai text
export const fontSans = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-sans",
  display: "swap",
});

// Backup font - Noto Sans Thai for broader Thai character support if needed
export const fontThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
});

// Alternative font - Prompt for headings and emphasis
export const fontHeading = Prompt({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-heading",
  display: "swap",
});
