package com.spring.last.controller

import com.spring.last.dto.ImageInfo
import com.spring.last.dto.ImageResponse
import com.spring.last.service.ImageService
import org.springframework.core.io.Resource
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files

@RestController
@RequestMapping("/api")
class ImageController(
	private val imageService: ImageService
) {
	@PostMapping("/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
	fun upload(@RequestPart("file") file: MultipartFile): ImageResponse {
		return imageService.saveImage(file)
	}
	
	@GetMapping("/image/{fileName}")
	fun serve(@PathVariable fileName: String): ResponseEntity<Resource> {
		val resource = imageService.loadImage(fileName)
		
		val contentType =
			Files.probeContentType(resource.file.toPath())
			?: "application/octet-stream"
		
		return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType(contentType))
			.body(resource)
	}
	
	@GetMapping("/info/{fileName}")
	fun info(@PathVariable fileName: String): ImageInfo {
		return imageService.getImageInfo(fileName)
	}
}