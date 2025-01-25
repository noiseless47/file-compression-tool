"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileCompressor from '../components/FileCompressor';
import FileDecompressor from '../components/FileDecompressor';
import { ModeToggle } from "@/components/mode-toggle";

const HomePage: React.FC = () => {
  return (
    <div className="container min-h-screen py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-3xl font-bold text-center">
            File Compression Tool
          </CardTitle>
          <ModeToggle />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
              <TabsTrigger 
                value="compress"
                className="data-[state=active]:bg-background"
              >
                Compress
              </TabsTrigger>
              <TabsTrigger 
                value="decompress"
                className="data-[state=active]:bg-background"
              >
                Decompress
              </TabsTrigger>
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