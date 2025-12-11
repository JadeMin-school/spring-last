import type { OutputFormat, CompressionMethod } from '../types';

/**
 * 출력 포맷에 따른 사용 가능한 압축 알고리즘 반환
 */
export function getAvailableMethodsForFormat(format: OutputFormat | ''): CompressionMethod[] {
	if (!format) return [];
	
	const methodsByFormat: Record<OutputFormat, CompressionMethod[]> = {
		JPEG: ['HUFFMAN', 'DCT', 'ARITHMETIC'],
		PNG: ['DEFLATE'],
		WEBP: ['WEBP_VP8', 'WEBP_VP8L'],
		GIF: ['LZW']  // GIF는 LZW만 지원 (RLE는 표준에서 거의 사용 안 됨)
	};
	
	return methodsByFormat[format] || [];
}

/**
 * 포맷에 따른 기본 압축 알고리즘 반환
 */
export function getDefaultMethodForFormat(format: OutputFormat | ''): CompressionMethod {
	const defaultMethods: Record<OutputFormat, CompressionMethod> = {
		JPEG: 'HUFFMAN',
		PNG: 'DEFLATE',
		WEBP: 'WEBP_VP8',
		GIF: 'LZW'
	};
	
	return format ? defaultMethods[format] : 'HUFFMAN';
}

/**
 * 압축 알고리즘 레이블 맵
 */
export const COMPRESSION_METHOD_LABELS: Record<CompressionMethod, string> = {
	HUFFMAN: 'Huffman Coding (JPEG 기본)',
	DCT: 'DCT (Discrete Cosine Transform)',
	DEFLATE: 'Deflate (PNG 전용, LZ77+Huffman)',
	LZ77: 'LZ77 (사용 안 함)',
	LZW: 'LZW (GIF 기본)',
	RLE: 'RLE (Run-Length Encoding)',
	ARITHMETIC: 'Arithmetic Coding (고급)',
	WEBP_VP8: 'WebP VP8 (손실)',
	WEBP_VP8L: 'WebP VP8L (무손실)'
};
