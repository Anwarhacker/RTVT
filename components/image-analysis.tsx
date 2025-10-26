"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ImageIcon, Upload, Eye } from "lucide-react";

interface AnalyzedImage {
  id: string;
  url: string;
  summary: string;
  loading: boolean;
  error?: string;
}

export function ImageAnalysis() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzedImages, setAnalyzedImages] = useState<AnalyzedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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
      summary: "",
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
    <div className="mt-6 space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
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

            {files.length > 0 && (
              <Button
                onClick={handleUploadAndAnalyze}
                disabled={uploading || analyzing}
              >
                {uploading
                  ? "Uploading..."
                  : analyzing
                  ? "Analyzing..."
                  : "Upload & Analyze"}
              </Button>
            )}

            {analyzedImages.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Analysis Results:</h3>
                {analyzedImages.map((img) => (
                  <Card key={img.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <img
                        src={img.url}
                        alt="Analyzed image"
                        className="w-full sm:w-24 h-auto sm:h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        {img.loading ? (
                          <p>Loading analysis...</p>
                        ) : img.error ? (
                          <p className="text-red-500">{img.error}</p>
                        ) : (
                          <p className="text-sm">{img.summary}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
