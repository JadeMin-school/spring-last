package com.spring.last.service

import com.spring.last.dto.CompressRequest
import com.spring.last.dto.CompressResponse
import com.spring.last.dto.OutputFormat
import com.spring.last.service.compression.GifCompressionService
import com.spring.last.service.compression.JpegCompressionService
import com.spring.last.service.compression.PngCompressionService
import com.spring.last.service.compression.WebPCompressionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.awt.image.BufferedImage
import java.nio.file.Files
import java.nio.file.Path
import java.util.*
import javax.imageio.ImageIO

@Service
class CompressService(
	private val jpegCompressionService: JpegCompressionService,
	private val pngCompressionService: PngCompressionService,
	private val webPCompressionService: WebPCompressionService,
	private val gifCompressionService: GifCompressionService
) {
	private val uploadDir: Path = Path.of("uploads").toAbsolutePath()
	
	fun compress(sourceFileName: String, request: CompressRequest): CompressResponse {
		val sourcePath = uploadDir.resolve(sourceFileName).normalize()
		
		if (!sourcePath.startsWith(uploadDir))
			throw ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied")
		
		if (!Files.exists(sourcePath))
			throw ResponseStatusException(HttpStatus.NOT_FOUND, "File not found")
		
		val originalImage = ImageIO.read(sourcePath.toFile())
			?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read image")
		
		val originalSize = Files.size(sourcePath)
		
		// 출력 포맷 결정
		val outputFormat = request.outputFormat ?: detectFormat(sourceFileName)
		
		// 압축 수행
		val (compressedData, finalQuality) = when {
			request.targetSizeKB != null -> compressToTargetSize(
				originalImage, outputFormat, request
			)
			else -> compressWithMethod(
				originalImage, outputFormat, request
			)
		}
		
		val mimeType = getMimeType(outputFormat)
		val compressionRatio = calculateCompressionRatio(originalSize, compressedData.size)
		
		return CompressResponse(
			base64 = Base64.getEncoder().encodeToString(compressedData),
			mimeType = mimeType,
			width = originalImage.width,
			height = originalImage.height,
			originalSizeBytes = originalSize,
			compressedSizeBytes = compressedData.size,
			compressionRatio = compressionRatio,
			method = "${request.method.name} (Q:$finalQuality)",
		)
	}
	
	/**
	 * 목표 크기에 맞춰 압축
	 */
	private fun compressToTargetSize(
		image: BufferedImage,
		format: OutputFormat,
		request: CompressRequest
	): Pair<ByteArray, Int> {
		val targetBytes = request.targetSizeKB!! * 1024
		var quality = request.quality
		var minQuality = 1
		var maxQuality = 100
		var bestResult: ByteArray? = null
		
		repeat(request.maxIterations) {
			val data = compressImage(image, format, quality, request)
			
			if (data.size <= targetBytes) {
				bestResult = data
				// 품질을 높여볼 수 있는지 시도
				minQuality = quality
				quality = (quality + maxQuality) / 2
			} else {
				// 품질을 낮춰야 함
				maxQuality = quality
				quality = (minQuality + quality) / 2
			}
			
			// 수렴 조건
			if (maxQuality - minQuality <= 1) {
				return (bestResult ?: data) to quality
			}
		}
		
		return (bestResult ?: compressImage(image, format, quality, request)) to quality
	}
	
	private fun compressWithMethod(
		image: BufferedImage,
		format: OutputFormat,
		request: CompressRequest
	): Pair<ByteArray, Int> {
		val quality = request.quality
		val data = compressImage(image, format, quality, request)
		return data to quality
	}
	
	private fun compressImage(
		image: BufferedImage,
		format: OutputFormat,
		quality: Int,
		request: CompressRequest
	): ByteArray {
		val adjustedRequest = request.copy(quality = quality)
		return when (format) {
			OutputFormat.JPEG -> jpegCompressionService.compress(image, adjustedRequest)
			OutputFormat.PNG -> pngCompressionService.compress(image, adjustedRequest)
			OutputFormat.WEBP -> webPCompressionService.compress(image, adjustedRequest)
			OutputFormat.GIF -> gifCompressionService.compress(image, adjustedRequest)
		}
	}
	
	private fun detectFormat(fileName: String): OutputFormat {
		val ext = fileName.substringAfterLast(".", "").lowercase()
		return when (ext) {
			"jpg", "jpeg" -> OutputFormat.JPEG
			"png" -> OutputFormat.PNG
			"webp" -> OutputFormat.WEBP
			"gif" -> OutputFormat.GIF
			else -> OutputFormat.JPEG
		}
	}
	
	private fun getMimeType(format: OutputFormat): String {
		return when (format) {
			OutputFormat.JPEG -> "image/jpeg"
			OutputFormat.PNG -> "image/png"
			OutputFormat.WEBP -> "image/webp"
			OutputFormat.GIF -> "image/gif"
		}
	}
	
	private fun calculateCompressionRatio(originalSize: Long, compressedSize: Int): Double {
		return ((originalSize - compressedSize).toDouble() / originalSize) * 100
	}
}
