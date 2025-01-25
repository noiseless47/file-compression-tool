"use client"

import React, { useState } from 'react';
import { Tabs } from 'antd';
import FileCompressor from '../components/FileCompressor';
import FileDecompressor from '../components/FileDecompressor';

const { TabPane } = Tabs;

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">
        File Compression Tool
      </h1>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        centered
      >
        <TabPane key="1" tab="Compress">
          <FileCompressor />
        </TabPane>
        <TabPane key="2" tab="Decompress">
          <FileDecompressor />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HomePage;