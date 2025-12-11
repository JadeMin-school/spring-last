package com.spring.last.dto

data class CompressRequest(
	val quality: Int = 100,
	val outputFormat: OutputFormat? = null,
	val method: CompressionMethod = CompressionMethod.HUFFMAN,
	
	// 공통 옵션
	val targetSizeKB: Int? = null,
	val maxIterations: Int = 10,
	val optimize: Boolean = true,
	val stripMetadata: Boolean = true,
	
	// JPEG 옵션
	val progressive: Boolean = false,
	val smoothingFactor: Int = 0
)

enum class CompressionMethod {
	DEFLATE,
	HUFFMAN,
	LZ77,
	LZW,
	RLE,
	ARITHMETIC,
	DCT,
	WEBP_VP8,
	WEBP_VP8L
}

