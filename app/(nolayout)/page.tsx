"use client";

import Image from "next/image";
import clsx from "clsx";

import { Providers } from "@/app/providers";

import { fontSans } from "@/config/fonts";

const teamMembers = [
  {
    name: "Akekarach Panumphan",
    position: "Project & Market Strategy Lead",
    description:
      "Oversees the product vision, aligns team operations, and crafts go-to-market strategies to ensure that Pordee is both technically sound and business-ready.",
    image: "/teams/Akekarach.png",
  },
  {
    name: "Thamonwan Kumam",
    position: "Product Owner & Financial Logic Designer",
    description:
      "Defines product priorities, works closely with developers, and designs financial algorithms that power personalized debt repayment plans.",
    image: "/teams/Thamonwan.png",
  },
  {
    name: "Kasira Phootijindanun",
    position: "UX Research & Insight Strategist",
    description:
      "Leads user interviews and behavioral research, synthesizing insights into actionable UX direction and supporting co-creation of user flows.",
    image: "/teams/Naramon.png",
  },
  {
    name: "Naramon Wanatanasuwan",
    position: "UX Flow Architect & Wireframe Designer",
    description:
      "Translates insights and product goals into structured user journeys and wireframes that bridge real user needs with functional design.",
    image: "/teams/Kasira.png",
  },
  {
    name: "Pimpida Ratanasuvan",
    position: "UX/UI Reviewer & Usability Designer",
    description:
      "Ensures visual and interaction consistency, refines user flows, and co-designs intuitive interfaces that enhance user experience.",
    image: "/teams/Pimpida.png",
  },
  {
    name: "Tinthiti Puttipeerawit",
    position: "Product Strategist & Presentation Lead",
    description:
      "Shapes product logic and communication, creates compelling presentations, and supports user testing to validate core ideas.",
    image: "/teams/Tinthiti.png",
  },
];

export default function LandingPage() {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="min-h-screen">
            {/* Hero Section */}
            <header className="relative bg-[#3C7DD1] text-white">
              <div className="flex items-center justify-between mb-8 bg-white p-4">
                <div className="flex items-center ml-10">
                  <Image
                    alt="Pordee Logo"
                    className="mr-2"
                    height={150}
                    src="/landing/weblogo.png"
                    width={150}
                  />
                </div>
              </div>
              <img alt="Pordee Logo" src="/banner.png" />
              <div className="relative z-10">
                <div className="flex flex-row items-center justify-between container mx-auto py-16">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      <span>Balance Your </span>
                      <span className="text-yellow-400">Debt</span>
                    </h1>
                    <h2 className="text-3xl md:text-3xl font-bold mb-6">
                      <span>Sustain Your </span>
                      <span className="text-yellow-400">Life</span>
                    </h2>
                    <p className="text-lg mb-8 text-white/80">
                      Pordee ผู้ช่วยวางแผนลดหนี้ที่เข้าใจคุณจริง พร้อมระบบ AI
                      ที่ช่วยวิเคราะห์และแนะนำวิธีจัดการหนี้อย่างเป็นระบบ
                      ใช้งานง่าย ไม่ต้องผูกกับธนาคาร
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        className="bg-yellow-400 text-white font-bold px-4 py-2 rounded text-center"
                        href="/home"
                      >
                        Get Start
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-center items-centers w-full">
                    <Image
                      alt="Pordee Dashboard"
                      height={600}
                      src="/landing/app.png"
                      width={400}
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* Why Pordee Section */}
            <section className="py-16 bg-[#3C7DD1] text-white">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-5xl font-bold text-start mb-12">
                  Why Pordee?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-6xl mx-auto ">
                  <div className="bg-white rounded-xl pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-4xl font-bold mb-2 text-gray-900">
                      เข้าใจ
                    </h3>
                    <h4 className="text-gray-700 mb-4 text-xl font-bold">
                      <span className="text-[#3C7DD1]">สถานะหนี้</span> ของตนเอง
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      เห็นภาพรวมหนี้ ชำระขั้นต่ำ ดอกเบี้ย และความเสี่ยง
                      ได้ภายในหน้าแรก
                    </p>
                  </div>

                  <div className="bg-white rounded-xl pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                      วางแผนหนี้ <span className="text-4xl">ง่าย</span>
                    </h3>
                    <h4 className="text-gray-700 mb-4 text-xl font-bold">
                      เหมือนมี
                      <span className="text-[#3C7DD1]">ที่ปรึกษาส่วนตัว</span>
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      เราใช้ AI ช่วยออกแบบแผนการชำระหนี้ที่เหมาะกับรายได้
                      รายจ่าย และและปรับตามพฤติกรรมการใช้จ่ายและเป้าหมายของคุณ
                    </p>
                  </div>

                  <div className="bg-white rounded-xl pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                      ปลอดภัยใช้ <span className="text-4xl">จริง</span>
                    </h3>
                    <h4 className="text-[#3C7DD1]mb-4 text-xl font-bold">
                      ไม่ใช่แค่คิดฝัน
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      Pordee ไม่ได้แค่คำนวณสูตรสำเร็จ
                      แต่เราเข้าใจชีวิตจริงของคุณ เราจึงวางแผนหนี้ให้เหมาะกับคุณ
                      เพื่อให้คุณสามารถ เริ่มได้ ทำได้ จนปลดหนี้สำเร็จ
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features Section */}
            <section className="py-16 bg-[#3C7DD1] text-white">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Key Feature
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="relative">
                      <Image
                        alt="Pordee Planner"
                        className="mx-auto"
                        height={500}
                        src="/landing/appshow0.png"
                        width={250}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center">
                          <svg
                            fill="none"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                            <path
                              d="M21 21L16.65 16.65"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Pordee Radar</h3>
                        <p className="text-gray-300">
                          สรุปสถานะหนี้และวิเคราะห์ความเสี่ยงทางการเงิน
                          พร้อมให้ข้อมูลทั้งหมดแสดงอยู่ในที่เดียว
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center">
                          <svg
                            fill="none"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                            <path
                              d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                            <path
                              d="M9 12H15"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                            <path
                              d="M9 16H15"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          Pordee Planner
                        </h3>
                        <p className="text-gray-300">
                          กำหนดเป้าหมาย วางแผนชำระหนี้ให้เหมาะกับคุณ
                          พร้อมแจ้งเตือนอัตโนมัติ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center">
                          <svg
                            fill="none"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10C20 15 12 22 12 22C12 22 4 15 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2Z"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                              stroke="white"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Pordee AI</h3>
                        <p className="text-gray-300">
                          กำหนดเป้าหมาย วางแผนชำระหนี้ที่เหมาะกับคุณ
                          พร้อมแจ้งเตือนอัตโนมัติ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Features Section - Updated with new UI from the image */}
                <div className="mt-16 flex flex-col">
                  {/* Pordee Radar Section */}
                  <div className="bg-[#3C7DD1] p-8 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 text-white mb-6 md:mb-0 md:pr-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Pordee Radar
                      </h3>
                      <p className="text-lg">
                        สรุปสถานะหนี้และวัดความเสี่ยงทางการเงิน
                        <br />
                        เพื่อให้มองเห็นภาพรวมและวางแผนได้แม่นยำ
                      </p>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                      <Image
                        alt="Pordee Radar"
                        className="rounded-lg shadow-xl"
                        height={500}
                        src="/landing/appshow2.png"
                        width={250}
                      />
                    </div>
                  </div>

                  {/* Pordee Planner Section */}
                  <div className="bg-[#3C7DD1] p-8 rounded-lg mb-8 flex flex-col-reverse md:flex-row items-center justify-between">
                    <div className="md:w-1/2 flex justify-center">
                      <Image
                        alt="Pordee Planner"
                        className="rounded-lg shadow-xl"
                        height={500}
                        src="/landing/appshow1.png"
                        width={250}
                      />
                    </div>
                    <div className="md:w-1/2 text-white mb-6 md:mb-0 md:pl-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Pordee Planner
                      </h3>
                      <p className="text-lg">
                        กำหนดเป้าหมาย วางแผนชำระหนี้ที่เหมาะสมกับคุณ
                        <br />
                        พร้อมเช็คเรื่องอื่นได้ด้วย
                      </p>
                    </div>
                  </div>

                  {/* Pordee Assistant Section */}
                  <div className="bg-[#3C7DD1] p-8 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 text-white mb-6 md:mb-0 md:pr-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Pordee Assistant
                      </h3>
                      <p className="text-lg">
                        AI ที่ช่วยตอบคำถามเรื่องหนี้ จากการวิเคราะห์พฤติกรรม
                        <br />
                        และสถานการณ์ของคุณ เพื่อให้คำแนะนำอย่างตรงจุด
                      </p>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                      <Image
                        alt="Pordee Assistant"
                        className="rounded-lg shadow-xl"
                        height={500}
                        src="/landing/appshow3.png"
                        width={250}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use Section - NEW */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-5xl font-bold text-center mb-16 text-[#3C7DD1]">
                  How to Use
                </h2>

                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto mb-12">
                  <div className="md:w-1/3 mb-8 md:mb-0">
                    <div className="">
                      <Image
                        alt="Step 1: Add Debt and Income Information"
                        className="rounded-lg"
                        height={600}
                        src="/landing/appshow4.png"
                        width={300}
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 md:pl-12">
                    <div className="flex items-center mb-4">
                      <div className="bg-[#3C7DD1] text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl font-bold mr-6">
                        1
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#3C7DD1]">
                        เพิ่มรายการหนี้และรายได้
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg mb-6">
                      ใส่ข้อมูลหนี้หรือบิลใดๆได้ในเจ้งหนี้ พร้อมระบุรายได้
                      <br />
                      Pordee จะวิเคราะห์ภาพรวมการเงินแบบอัตโนมัติ
                      <br />
                      และสรุปผลด้วย Pordee Radar
                      <br />
                      เพื่อให้คุณเห็นภาพรวมสถานะการเงินของคุณอย่างชัดเจน
                    </p>
                    <div className="text-right">
                      <a href="/planning" className="inline-block bg-yellow-400 rounded-lg p-2">
                        <span className="text-xl font-bold text-white">
                          ต่อไป
                        </span>
                        <span className="text-yellow-600 ml-2">▶</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#3C7DD1] text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">
                  พร้อมเริ่มจัดการหนี้อย่างชาญฉลาด?
                </h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  เริ่มต้นใช้งาน Pordee วันนี้ ฟรี ไม่มีค่าใช้จ่าย
                </p>
                <a
                  className="inline-block bg-yellow-400 text-white font-bold px-8 py-3 rounded-lg text-lg"
                  href="/home"
                >
                  Get Start
                </a>
              </div>
            </section>

            {/* Our Team Section */}
            <section className="py-16 bg-[#3C7DD1] text-white">
              <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <h2 className="text-4xl font-bold text-center mb-16">
                  Our Team
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="bg-blue-700 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="flex items-start">
                          <div className=" bg-white rounded-md overflow-hidden mr-4 flex-shrink-0">
                            <Image
                              alt={member.name}
                              className="object-cover w-full h-full"
                              height={64}
                              src={member.image}
                              width={64}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {member.name}
                            </h3>
                            <p className="text-blue-200 text-xs leading-tight mt-1">
                              {member.position}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 text-center">
                  <h3 className="text-2xl font-bold mb-6">ทดลองใช้ตอนนี้</h3>
                  <a
                    className="inline-block bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full text-lg"
                    href="/home"
                  >
                    Get Start
                  </a>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-gray-800 text-white">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    <Image
                      alt="Pordee Logo"
                      className="mr-2"
                      height={40}
                      src="/landing/weblogo.png"
                      width={100}
                    />
                    <span className="text-xl font-bold">Pordee</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    © {new Date().getFullYear()} Pordee. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
