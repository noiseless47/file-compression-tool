"use client"

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { decompressFile, DecompressionResult } from '../utils/compressionUtils';

const FileDecompressor: React.FC = () => {
  const [decompressedFile, setDecompressedFile] = useState<DecompressionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const result = await decompressFile(file);
      setDecompressedFile(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleDownload = () => {
    if (decompressedFile) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(decompressedFile.file);
      link.download = decompressedFile.file.name;
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200 ease-in-out
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          hover:border-primary hover:bg-primary/5
        `}
      >
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
          id="file-upload-decompress"
        />
        <label
          htmlFor="file-upload-decompress"
          className="cursor-pointer block"
        >
          <div className="text-lg mb-2">Drop compressed file here or click to upload</div>
          <p className="text-sm text-muted-foreground">
            Support for single file upload
          </p>
        </label>
      </div>

      {decompressedFile && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Compressed Size</p>
                  <p className="font-medium">{decompressedFile.compressedSize} bytes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Decompressed Size</p>
                  <p className="font-medium">{decompressedFile.decompressedSize} bytes</p>
                </div>
              </div>
              
              <Button 
                onClick={handleDownload}
                className="w-full"
              >
                Download Decompressed File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileDecompressor;