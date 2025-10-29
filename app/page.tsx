"use client";

import { IntroSection } from "@/components/intro-section";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/translator");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
      <IntroSection onContinue={handleContinue} />
    </div>
  );
}
