"use client"

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileCompressor from '../components/FileCompressor';
import FileDecompressor from '../components/FileDecompressor';

const HomePage: React.FC = () => {
  return (
    <div className="container min-h-screen py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            File Compression Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="compress">Compress</TabsTrigger>
              <TabsTrigger value="decompress">Decompress</TabsTrigger>
            </TabsList>
            <TabsContent value="compress">
              <FileCompressor />
            </TabsContent>
            <TabsContent value="decompress">
              <FileDecompressor />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;