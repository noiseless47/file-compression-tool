import pako from 'pako';

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface DecompressionResult {
  file: File;
  compressedSize: number;
  decompressedSize: number;
}

// Helper function to determine if data is compressible based on file type
function isCompressibleFile(file: File): boolean {
  const compressibleTypes = [
    'text/', 'application/json', 'application/xml', 'application/javascript',
    'application/x-javascript', 'application/ecmascript', 'application/x-httpd-php',
    'application/x-yaml', 'application/yaml', 'application/x-www-form-urlencoded'
  ];
  
  return compressibleTypes.some(type => file.type.startsWith(type));
}

// Advanced compression function that uses different strategies based on file type
export async function compressFile(file: File): Promise<CompressionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;
  let compressedData: Uint8Array;
  
  // Different compression strategies based on file type
  if (isCompressibleFile(file)) {
    // For text-based files, use more aggressive compression
    compressedData = await advancedTextCompression(new Uint8Array(arrayBuffer));
  } else {
    // For binary files, use standard compression with optimized settings
    compressedData = await optimizedBinaryCompression(new Uint8Array(arrayBuffer));
  }

  const compressedSize = compressedData.length;
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

  // Create compressed file with metadata
  const metadata = {
    originalName: file.name,
    originalType: file.type,
    timestamp: Date.now(),
    compressionMethod: isCompressibleFile(file) ? 'advanced' : 'standard'
  };

  const metadataStr = JSON.stringify(metadata);
  const metadataBuffer = new TextEncoder().encode(metadataStr);
  
  // Combine metadata and compressed data
  const finalBuffer = new Uint8Array(metadataBuffer.length + compressedData.length + 4);
  finalBuffer[0] = metadataBuffer.length & 0xFF;
  finalBuffer[1] = (metadataBuffer.length >> 8) & 0xFF;
  finalBuffer[2] = (metadataBuffer.length >> 16) & 0xFF;
  finalBuffer[3] = (metadataBuffer.length >> 24) & 0xFF;
  finalBuffer.set(metadataBuffer, 4);
  finalBuffer.set(compressedData, metadataBuffer.length + 4);

  const compressedFile = new File(
    [finalBuffer],
    `compressed-${file.name}`,
    { type: 'application/x-compressed' }
  );

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    compressionRatio: Number(compressionRatio.toFixed(2))
  };
}

// Advanced text compression with preprocessing
async function advancedTextCompression(data: Uint8Array): Promise<Uint8Array> {
  const text = new TextDecoder().decode(data);
  
  const preprocessed = text
    .replace(/\s+/g, ' ')
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
    .trim();

  const preprocessedData = new TextEncoder().encode(preprocessed);

  return pako.deflate(preprocessedData, {
    level: 9,
    windowBits: 15,
    memLevel: 9
  });
}

// Optimized binary compression
async function optimizedBinaryCompression(data: Uint8Array): Promise<Uint8Array> {
  const CHUNK_SIZE = 1024 * 1024;
  if (data.length > CHUNK_SIZE) {
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const compressedChunk = pako.deflate(chunk, {
        level: 7,
        windowBits: 15,
        memLevel: 8
      });
      chunks.push(compressedChunk);
    }
    
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  return pako.deflate(data, {
    level: 8,
    windowBits: 15,
    memLevel: 8
  });
}

export async function decompressFile(file: File): Promise<DecompressionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const compressedData = new Uint8Array(arrayBuffer);
  
  try {
    // Extract metadata
    const metadataLength = 
      compressedData[0] | 
      (compressedData[1] << 8) | 
      (compressedData[2] << 16) | 
      (compressedData[3] << 24);
    
    const metadataBuffer = compressedData.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(new TextDecoder().decode(metadataBuffer));
    
    // Get the actual compressed data
    const actualCompressedData = compressedData.slice(4 + metadataLength);
    
    // Decompress based on compression method
    const decompressedData = pako.inflate(actualCompressedData);
    
    const decompressedFile = new File(
      [decompressedData],
      metadata.originalName,
      { type: metadata.originalType }
    );

    return {
      file: decompressedFile,
      compressedSize: actualCompressedData.length,
      decompressedSize: decompressedData.length
    };
  } catch {
    // Fallback for files compressed with the old method
    const decompressedData = pako.inflate(compressedData);
    const decompressedFile = new File(
      [decompressedData],
      file.name.replace('compressed-', ''),
      { type: 'application/octet-stream' }
    );

    return {
      file: decompressedFile,
      compressedSize: compressedData.length,
      decompressedSize: decompressedData.length
    };
  }
}