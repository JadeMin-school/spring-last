package com.spring.last.dto

data class ImageInfo(
	val fileName: String,
	val width: Int,
	val height: Int,
	val format: String,
	val fileSizeBytes: Long,
)
