package com.spring.last.controller

import com.spring.last.dto.CompressRequest
import com.spring.last.dto.CompressResponse
import com.spring.last.service.CompressService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/compress")
class CompressController(
	private val compressService: CompressService
) {
	@PostMapping("/{fileName}")
	fun compress(
		@PathVariable fileName: String,
		@RequestBody request: CompressRequest
	): CompressResponse {
		try {
			return compressService.compress(fileName, request)
		} catch (e: Exception) {
			e.printStackTrace()
			throw e
		}
	}
}
