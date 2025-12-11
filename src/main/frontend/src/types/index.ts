/**
 * 타입 정의 모음
 */

export type ResizeAlgorithm =
	| 'NEAREST_NEIGHBOR'
	| 'BILINEAR'
	| 'BICUBIC'
	| 'LANCZOS'
	| 'PROGRESSIVE_BILINEAR';

export type OutputFormat = 'JPEG' | 'PNG' | 'WEBP' | 'GIF';

export type CompressionMethod = 
	| 'DEFLATE' 
	| 'HUFFMAN' 
	| 'LZ77' 
	| 'LZW' 
	| 'RLE' 
	| 'ARITHMETIC' 
	| 'DCT' 
	| 'WEBP_VP8' 
	| 'WEBP_VP8L';



export interface ImageInfo {
	fileName: string;
	width: number;
	height: number;
	format: string;
	fileSizeBytes: number;
}

export interface ResizeResult {
	base64: string;
	mimeType: string;
	width: number;
	height: number;
	algorithm: string;
}

export interface CompressResult {
	base64: string;
	mimeType: string;
	width: number;
	height: number;
	originalSizeBytes: number;
	compressedSizeBytes: number;
	compressionRatio: number;
	method: string;
}

export type Result = ResizeResult | CompressResult;
