package com.spring.last.dto

data class ResizeRequest(
	val width: Int? = null,
	val height: Int? = null,
	val algorithm: ResizeAlgorithm = ResizeAlgorithm.LANCZOS,
	val maintainAspectRatio: Boolean = true,
	val scalePercent: Double? = null,  // width/height 대신 퍼센트로 지정
	val outputFormat: OutputFormat? = null,  // null이면 원본 포맷 유지
	val quality: Int = 90,  // JPEG/WebP 품질 (1-100)
)

enum class ResizeAlgorithm {
	// Java2D 기본 제공
	NEAREST_NEIGHBOR,  // 가장 빠름, 품질 낮음, 픽셀아트에 적합
	BILINEAR,          // 중간 속도/품질
	BICUBIC,           // 느리지만 고품질
	
	// 고급 알고리즘 (직접 구현)
	LANCZOS,           // 가장 고품질, 다운스케일에 최적
	
	// 다단계 리사이징
	PROGRESSIVE_BILINEAR,  // 점진적 축소로 품질 향상
}

enum class OutputFormat {
	JPEG,
	PNG,
	WEBP,
	GIF
}
