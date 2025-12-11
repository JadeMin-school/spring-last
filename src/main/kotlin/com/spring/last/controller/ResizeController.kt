package com.spring.last.controller

import com.spring.last.dto.ResizeRequest
import com.spring.last.dto.ResizeResponse
import com.spring.last.service.ResizeService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/resize")
class ResizeController(
	private val resizeService: ResizeService
) {
	@PostMapping("/{fileName}")
	fun resize(
		@PathVariable fileName: String,
		@RequestBody request: ResizeRequest
	): ResizeResponse {
		return resizeService.resize(fileName, request)
	}
}
