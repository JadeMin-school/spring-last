package com.spring.last.dto

data class CompressResponse(
	val base64: String,
	val mimeType: String,
	val width: Int,
	val height: Int,
	val originalSizeBytes: Long,
	val compressedSizeBytes: Int,
	val compressionRatio: Double,
	val method: String,
)
