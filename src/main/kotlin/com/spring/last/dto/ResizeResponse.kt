package com.spring.last.dto

data class ResizeResponse(
	val base64: String,
	val mimeType: String,
	val width: Int,
	val height: Int,
	val algorithm: String,
)
