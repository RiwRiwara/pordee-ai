"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { RadioGroup, Radio } from "@heroui/radio";
import { Textarea } from "@heroui/input";
import { FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useTracking } from "@/lib/tracking";
import { toast } from "react-hot-toast";

interface SurveyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: (skipped?: boolean) => void;
  /**
   * Source where the survey is being opened from (for analytics)
   * @default 'debt_plan' - From debt plan flow
   */
  source?: 'debt_plan' | 'profile';
}

export default function SurveyModal({
  isOpen,
  onOpenChange,
  onComplete,
  source = 'debt_plan',
}: SurveyModalProps) {
  const { data: session } = useSession();
  const { trackCompletion } = useTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Survey responses
  const [debtInputUnderstandingRating, setDebtInputUnderstandingRating] = useState<number | null>(null);
  const [debtInputUnderstandingComment, setDebtInputUnderstandingComment] = useState("");

  const [radarUnderstandingRating, setRadarUnderstandingRating] = useState<number | null>(null);
  const [radarUnderstandingComment, setRadarUnderstandingComment] = useState("");

  const [debtPlanHelpfulnessRating, setDebtPlanHelpfulnessRating] = useState<number | null>(null);
  const [debtPlanHelpfulnessComment, setDebtPlanHelpfulnessComment] = useState("");

  const [appUsabilityRating, setAppUsabilityRating] = useState<number | null>(null);
  const [appUsabilityComment, setAppUsabilityComment] = useState("");

  const [additionalFeedback, setAdditionalFeedback] = useState("");
  
  // Fetch existing survey if available when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingSurvey();
    }
  }, [isOpen]);
  
  // Function to fetch existing survey
  const fetchExistingSurvey = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/survey");
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // Populate form with existing data
          const survey = data.data;
          setDebtInputUnderstandingRating(survey.debtInputUnderstandingRating);
          setDebtInputUnderstandingComment(survey.debtInputUnderstandingComment || "");
          setRadarUnderstandingRating(survey.radarUnderstandingRating);
          setRadarUnderstandingComment(survey.radarUnderstandingComment || "");
          setDebtPlanHelpfulnessRating(survey.debtPlanHelpfulnessRating);
          setDebtPlanHelpfulnessComment(survey.debtPlanHelpfulnessComment || "");
          setAppUsabilityRating(survey.appUsabilityRating);
          setAppUsabilityComment(survey.appUsabilityComment || "");
          setAdditionalFeedback(survey.additionalFeedback || "");
        }
      }
    } catch (error) {
      console.error("Error fetching survey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rating labels
  const getRatingLabel = (questionType: string, value: number): string => {
    const labels = {
      debtInput: [
        "ไม่เข้าใจเลย",
        "เข้าใจนิดหน่อย",
        "พอเข้าใจ",
        "เข้าใจดี",
        "เข้าใจได้อย่างชัดเจนมาก",
      ],
      radar: [
        "ไม่ช่วยเลย",
        "ช่วยนิดหน่อย",
        "พอช่วยได้",
        "ช่วยได้",
        "ช่วยได้ดีมาก",
      ],
      debtPlan: [
        "ไม่เลย",
        "เริ่มเห็นนิดหน่อย",
        "พอเห็นทางอยู่บ้าง",
        "เห็นทางชัดเจน",
        "เห็นทางและมั่นใจว่าเริ่มได้เลย",
      ],
      usability: [
        "ยากมาก",
        "ค่อนข้างยาก",
        "ป่านกลาง",
        "ค่อนข้างง่าย",
        "ง่ายมาก",
      ],
    };

    return labels[questionType as keyof typeof labels][value - 1];
  };

  // Reset form function
  const resetForm = () => {
    setDebtInputUnderstandingRating(null);
    setDebtInputUnderstandingComment("");
    setRadarUnderstandingRating(null);
    setRadarUnderstandingComment("");
    setDebtPlanHelpfulnessRating(null);
    setDebtPlanHelpfulnessComment("");
    setAppUsabilityRating(null);
    setAppUsabilityComment("");
    setAdditionalFeedback("");
    setError("");
  };
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!debtInputUnderstandingRating || !radarUnderstandingRating ||
      !debtPlanHelpfulnessRating || !appUsabilityRating) {
      setError("กรุณาให้คะแนนในทุกข้อคำถาม");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debtInputUnderstandingRating,
          debtInputUnderstandingComment,
          radarUnderstandingRating,
          radarUnderstandingComment,
          debtPlanHelpfulnessRating,
          debtPlanHelpfulnessComment,
          appUsabilityRating,
          appUsabilityComment,
          additionalFeedback,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งแบบสอบถาม");
      }

      // Track survey completion based on source
      if (source === 'debt_plan') {
        trackCompletion();
      }

      // Success message
      toast.success("ขอบคุณสำหรับการตอบแบบสอบถาม");
      
      // Close modal and notify parent that survey was completed
      onComplete(false);
      onOpenChange(false);
      
      // Reset form
      resetForm();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการส่งแบบสอบถาม");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent className="max-w-2xl mx-auto w-[95%] max-h-[90vh]">
        <ModalHeader className="flex justify-between items-center p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold">แบบสอบถามความคิดเห็น</h2>
  
        </ModalHeader>
        <ModalBody className="pb-4 px-3 sm:px-6 sm:pb-5 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-3">
                <h3 className="font-medium">1. ท่านเข้าใจวิธีกรอกข้อมูลหนี้ในระบบไหม?</h3>
                <RadioGroup
                  value={debtInputUnderstandingRating?.toString() || ""}
                  onValueChange={(value) => setDebtInputUnderstandingRating(parseInt(value))}
                  orientation="horizontal"
                  className="flex justify-between gap-0.5 sm:gap-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Radio
                      key={`debt-input-${value}`}
                      value={value.toString()}
                      className="flex flex-col items-center"
                      size="sm"
                    >
                      <span className="text-xs sm:text-sm mt-1 text-center">{getRatingLabel("debtInput", value)}</span>
                    </Radio>
                  ))}
                </RadioGroup>
                <div>
                  <div className="text-sm text-gray-600 block mb-1">
                    (ถ้ามี) มีจุดไหนในการกรอกข้อมูลที่ยังทำให้คุณรู้สึกสับสนไหม?
                  </div>
                  <Textarea
                    value={debtInputUnderstandingComment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebtInputUnderstandingComment(e.target.value)}
                    placeholder="ช่องพิมพ์ (ไม่บังคับ)"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <h3 className="font-medium">2. Radar ช่วยให้ท่านเห็นภาพรวมหนี้ได้ไหม?</h3>
                <RadioGroup
                  value={radarUnderstandingRating?.toString() || ""}
                  onValueChange={(value) => setRadarUnderstandingRating(parseInt(value))}
                  orientation="horizontal"
                  className="flex justify-between gap-0.5 sm:gap-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Radio
                      key={`radar-${value}`}
                      value={value.toString()}
                      className="flex flex-col items-center"
                      size="sm"
                    >
                      <span className="text-xs sm:text-sm mt-1 text-center">{getRatingLabel("radar", value)}</span>
                    </Radio>
                  ))}
                </RadioGroup>
                <div>
                  <div className="text-sm text-gray-600 block mb-1">
                    (ถ้ามี) มีอะไรยังไม่ชัดใน Radar ที่อยากให้ทำให้เข้าใจง่ายขึ้นไหม?
                  </div>
                  <Textarea
                    value={radarUnderstandingComment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRadarUnderstandingComment(e.target.value)}
                    placeholder="ช่องพิมพ์ (ไม่บังคับ)"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3">
                <h3 className="font-medium">3. แผนการจัดการหนี้ทำให้คุณเห็นทางออกจากหนี้หรือไม่?</h3>
                <RadioGroup
                  value={debtPlanHelpfulnessRating?.toString() || ""}
                  onValueChange={(value) => setDebtPlanHelpfulnessRating(parseInt(value))}
                  orientation="horizontal"
                  className="flex justify-between gap-0.5 sm:gap-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Radio
                      key={`debt-plan-${value}`}
                      value={value.toString()}
                      className="flex flex-col items-center"
                      size="sm"
                    >
                      <span className="text-xs sm:text-sm mt-1 text-center">{getRatingLabel("debtPlan", value)}</span>
                    </Radio>
                  ))}
                </RadioGroup>
                <div>
                  <div className="text-sm text-gray-600 block mb-1">
                    (ถ้ามี) มีอะไรใน Planner ที่ยังทำให้ท่านไม่แน่ใจหรือยังลังเลไหม?
                  </div>
                  <Textarea
                    value={debtPlanHelpfulnessComment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDebtPlanHelpfulnessComment(e.target.value)}
                    placeholder="ช่องพิมพ์ (ไม่บังคับ)"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-3">
                <h3 className="font-medium">4. โดยรวมแล้ว แอปนี้ใช้ง่ายแค่ไหน?</h3>
                <RadioGroup
                  value={appUsabilityRating?.toString() || ""}
                  onValueChange={(value) => setAppUsabilityRating(parseInt(value))}
                  orientation="horizontal"
                  className="flex justify-between gap-0.5 sm:gap-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Radio
                      key={`usability-${value}`}
                      value={value.toString()}
                      className="flex flex-col items-center"
                      size="sm"
                    >
                      <span className="text-xs sm:text-sm mt-1 text-center">{getRatingLabel("usability", value)}</span>
                    </Radio>
                  ))}
                </RadioGroup>
                <div>
                  <div className="text-sm text-gray-600 block mb-1">
                    (ถ้ามี) มีอะไรในแอปนี้ที่ยังทำให้ท่านสับสนหรือไม่ชอบไหม?
                  </div>
                  <Textarea
                    value={appUsabilityComment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppUsabilityComment(e.target.value)}
                    placeholder="ช่องพิมพ์ (ไม่บังคับ)"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Question 5 */}
              <div className="space-y-3">
                <h3 className="font-medium">
                  5. มีอะไรเพิ่มเติมที่อยากให้เรารู้ หรืออยากให้ Pordee ปรับปรุงตรงไหนไหม?
                </h3>
                <Textarea
                  value={additionalFeedback}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdditionalFeedback(e.target.value)}
                  placeholder="ช่องพิมพ์ (ไม่บังคับ)"
                  className="w-full"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Button group */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <Button
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
                  color="primary"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                  onPress={handleSubmit}
                >
                  ยืนยันแบบสอบถาม
                </Button>
                <Button
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
                  color="default"
                  variant="ghost"
                  isDisabled={isSubmitting}
                  onPress={() => {
                    // Skip survey
                    onComplete(true);
                    onOpenChange(false);
                  }}
                >
                  ข้ามแบบสอบถาม
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
