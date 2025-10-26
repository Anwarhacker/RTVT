"use client";

import { ImageAnalysis } from "../../components/image-analysis";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

export default function ImageAnalysisPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Image Analysis</h1>
      </div>

      <ImageAnalysis />
    </div>
  );
}
