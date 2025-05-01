"use client";

import Image from "next/image";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";

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
                <h2 className="text-3xl font-bold text-center mb-12">
                  Why Pordee?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto ">
                  <div className="bg-white rounded-lg pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                      เข้าใจ
                    </h3>
                    <h4 className="text-sky-600 mb-4 text-xl font-bold">
                      สถานะหนี้ของคุณเอง
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      เห็นภาพรวมหนี้ ชำระขั้นต่ำ ดอกเบี้ย และความเสี่ยง
                      ได้ภายในหน้าแรก
                    </p>
                  </div>

                  <div className="bg-white rounded-lg pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                      วางแผนหนี้ ง่าย
                    </h3>
                    <h4 className="text-sky-600 mb-4 text-xl font-bold">
                      เหมือนมีที่ปรึกษาส่วนตัว
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      เราใช้ AI ช่วยออกแบบแผนการชำระหนี้ที่เหมาะกับรายได้
                      จำนวนหนี้ และเป้าหมายของคุณ
                    </p>
                  </div>

                  <div className="bg-white rounded-lg pt-8 pb-2 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                      ปลอดภัยใช้ จริง
                    </h3>
                    <h4 className="text-sky-600 mb-4 text-xl font-bold">
                      ไม่ใช่แค่คิดฝัน
                    </h4>
                    <div className="w-full h-px bg-gray-200 my-4" />
                    <p className="text-gray-700 text-lg mx-16">
                      Pordee ไม่ได้เก็บรวบรวมสูตรสำเร็จ
                      แต่เราเข้าใจชีวิตของคนมีหนี้
                      เราจึงวางแผนหนี้ให้เหมาะกับคุณ เพื่อให้คุณสามารถ
                      เริ่มใช้ได้ทันที
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

                <div className="mt-16 flex justify-center">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <Image
                        alt="Pordee Assistant"
                        className="mx-auto"
                        height={400}
                        src="/landing/appshow1.png"
                        width={200}
                      />
                    </div>
                    <div className="col-span-1">
                      <Image
                        alt="Pordee Debt Overview"
                        className="mx-auto"
                        height={400}
                        src="/landing/appshow2.png"
                        width={200}
                      />
                    </div>
                    <div className="col-span-1">
                      <Image
                        alt="Pordee AI Insight"
                        className="mx-auto"
                        height={400}
                        src="/landing/appshow3.png"
                        width={200}
                      />
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
                  className="inline-block bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg text-lg"
                  href="/home"
                >
                  Get Start
                </a>
              </div>
            </section>

            {/* Our Team Section */}
            <section className="py-16 bg-[#3C7DD1] text-white">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Our Team
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Akekarach Panumphan"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Akekarach Panumphan
                        </h3>
                        <p className="text-blue-200">
                          Project & Market Strategy Lead
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Oversees the product vision, aligns team objectives, and
                      crafts go-to-market strategies to ensure that Pordee is
                      both technically sound and business-ready.
                    </p>
                  </div>

                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Thamonwan Kumam"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Thamonwan Kumam</h3>
                        <p className="text-blue-200">
                          Product Owner & Financial Logic Designer
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Defines product priorities, works closely with developers,
                      and designs financial algorithms that power personalized
                      debt repayment plans.
                    </p>
                  </div>

                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Kasira Phootijindanun"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Kasira Phootijindanun
                        </h3>
                        <p className="text-blue-200">
                          UX Research & Insight Strategist
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Leads user research and testing processes, synthesizing
                      insights into actionable UX direction and supporting
                      co-creation of user flows.
                    </p>
                  </div>

                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Naramon Wanatanasuwan"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Naramon Wanatanasuwan
                        </h3>
                        <p className="text-blue-200">
                          UX Flow Architect & Wireframe Designer
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Translates user research insights into structured user
                      journey and wireframes that bridge real user needs with
                      functional design.
                    </p>
                  </div>

                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Pimpida Ratanasuvan"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Pimpida Ratanasuvan
                        </h3>
                        <p className="text-blue-200">
                          UX/UI Reviewer & Usability Designer
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Ensures visual and interaction consistency, refines user
                      flows, and co-designs intuitive interfaces that enhance
                      user experience.
                    </p>
                  </div>

                  <div className="bg-blue-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                        <Image
                          alt="Tinthiti Puttipeerawit"
                          className="object-cover w-full h-full"
                          height={64}
                          src="/teams/team1.png"
                          width={64}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Tinthiti Puttipeerawit
                        </h3>
                        <p className="text-blue-200">
                          Product Strategist & Presentation Lead
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      Shapes product logic and communication, creates compelling
                      presentations, and supports user testing to validate core
                      ideas.
                    </p>
                  </div>
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
