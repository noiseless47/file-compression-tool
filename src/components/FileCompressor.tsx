"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { compressFile, CompressionResult } from '../utils/compressionUtils';

const FileCompressor: React.FC = () => {
  const [compressedFile, setCompressedFile] = useState<CompressionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState({
    totalCompressed: 0,
    totalSaved: 0,
    averageRatio: 0,
  });

  const handleFileUpload = async (file: File) => {
    try {
      const result = await compressFile(file);
      setCompressedFile(result);
      
      // Update stats
      setStats(prev => {
        const newTotalCompressed = prev.totalCompressed + 1;
        const bytesSaved = result.originalSize - result.compressedSize;
        const newTotalSaved = prev.totalSaved + bytesSaved;
        const newAverageRatio = ((prev.averageRatio * prev.totalCompressed) + result.compressionRatio) / newTotalCompressed;
        
        // Save to localStorage
        localStorage.setItem('compressionStats', JSON.stringify({
          totalCompressed: newTotalCompressed,
          totalSaved: newTotalSaved,
          averageRatio: newAverageRatio,
        }));

        return {
          totalCompressed: newTotalCompressed,
          totalSaved: newTotalSaved,
          averageRatio: newAverageRatio,
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Load stats from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('compressionStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleDownload = () => {
    if (compressedFile) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(compressedFile.file);
      link.download = compressedFile.file.name;
      link.click();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="text-lg mb-2">Drop files here or click to upload</div>
          <p className="text-sm text-muted-foreground">
            Support for single file upload
          </p>
        </label>
      </div>

      {compressedFile && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compression Rate</span>
                  <span className="font-medium">
                    {typeof compressedFile.compressionRatio === 'number' 
                      ? `${compressedFile.compressionRatio.toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <Progress 
                  value={typeof compressedFile.compressionRatio === 'number' 
                    ? compressedFile.compressionRatio 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Original Size</p>
                  <p className="font-medium">{formatBytes(compressedFile.originalSize)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Compressed Size</p>
                  <p className="font-medium">{formatBytes(compressedFile.compressedSize)}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleDownload}
                className="w-full"
              >
                Download Compressed File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-muted-foreground text-sm">Files Compressed</p>
              <p className="text-2xl font-bold">{stats.totalCompressed || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Average Compression</p>
              <p className="text-2xl font-bold">
                {typeof stats.averageRatio === 'number' 
                  ? `${stats.averageRatio.toFixed(1)}%` 
                  : '0%'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Space Saved</p>
              <p className="text-2xl font-bold">{formatBytes(stats.totalSaved || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileCompressor;