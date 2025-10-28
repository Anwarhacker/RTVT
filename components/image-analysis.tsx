"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, Eye } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
];

interface AnalyzedImage {
  id: string;
  url: string;
  summary: Record<string, string>;
  loading: boolean;
  error?: string;
}

export function ImageAnalysis() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzedImages, setAnalyzedImages] = useState<AnalyzedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    // Reset previous results
    setAnalyzedImages([]);
  };

  const handleUploadAndAnalyze = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setAnalyzing(true);

    const newImages: AnalyzedImage[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      url: "",
      summary: {},
      loading: true,
    }));

    setAnalyzedImages(newImages);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/image-upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const uploadData = await uploadRes.json();
        const imageUrl = uploadData.url;

        // Update image with URL
        setAnalyzedImages((prev) =>
          prev.map((img) =>
            img.id === newImages[i].id ? { ...img, url: imageUrl } : img
          )
        );

        // Analyze image
        const analyzeRes = await fetch("/api/image-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl,
            prompt: "Analyze this image and provide a summary of its content.",
            languages: selectedLanguages,
          }),
        });

        if (!analyzeRes.ok) throw new Error("Analysis failed");

        const analyzeData = await analyzeRes.json();

        setAnalyzedImages((prev) =>
          prev.map((img) =>
            img.id === newImages[i].id
              ? { ...img, summary: analyzeData.summary, loading: false }
              : img
          )
        );
      } catch (error) {
        console.error("Error processing image:", error);
        setAnalyzedImages((prev) =>
          prev.map((img) =>
            img.id === newImages[i].id
              ? { ...img, loading: false, error: "Failed to process image" }
              : img
          )
        );
      }
    }

    setUploading(false);
    setAnalyzing(false);
  };

  return (
    <Card className="p-4 sm:p-6 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm rounded-xl sm:rounded-2xl">
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outline"
                className="cursor-pointer w-full rounded-lg shadow-sm text-sm sm:text-base h-9 sm:h-10"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Images
                </span>
              </Button>
            </label>
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {files.length} image(s) selected
              </p>
            )}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <Select
              value={selectedLanguages.join(",")}
              onValueChange={(value) => setSelectedLanguages(value.split(","))}
            >
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Select languages" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUploadAndAnalyze}
              disabled={!files.length || uploading || analyzing}
              className="w-full rounded-lg shadow-sm text-sm sm:text-base h-9 sm:h-10"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : analyzing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {analyzedImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Analysis Results
            </h2>
            <div className="grid gap-3 sm:gap-4">
              {analyzedImages.map((img) => (
                <Card
                  key={img.id}
                  className="p-4 sm:p-5 hover:shadow-md transition-shadow border border-border/30 bg-card/90 rounded-lg sm:rounded-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <img
                      src={img.url}
                      alt="Analyzed image"
                      className="w-full sm:w-32 h-auto sm:h-32 object-cover rounded-lg border"
                    />
                    <div className="flex-1 space-y-3">
                      {img.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            Analyzing image...
                          </p>
                        </div>
                      ) : img.error ? (
                        <p className="text-sm text-red-500">{img.error}</p>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(img.summary).map(([lang, text]) => (
                            <div key={lang} className="space-y-1">
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium capitalize">
                                {lang}
                              </span>
                              <p className="text-sm text-foreground leading-relaxed pl-2">
                                {text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
