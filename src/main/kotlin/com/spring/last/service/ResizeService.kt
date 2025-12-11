package com.spring.last.service

import com.spring.last.dto.OutputFormat
import com.spring.last.dto.ResizeAlgorithm
import com.spring.last.dto.ResizeRequest
import com.spring.last.dto.ResizeResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.awt.RenderingHints
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.nio.file.Files
import java.nio.file.Path
import java.util.*
import javax.imageio.IIOImage
import javax.imageio.ImageIO
import javax.imageio.ImageWriteParam
import kotlin.math.*

@Service
class ResizeService(
	private val imageService: ImageService
) {
	private val uploadDir: Path = Path.of("uploads").toAbsolutePath()
	
	fun resize(sourceFileName: String, request: ResizeRequest): ResizeResponse {
		val sourcePath = uploadDir.resolve(sourceFileName).normalize()
		
		if (!sourcePath.startsWith(uploadDir))
			throw ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied")
		
		if (!Files.exists(sourcePath))
			throw ResponseStatusException(HttpStatus.NOT_FOUND, "File not found")
		
		val originalImage = ImageIO.read(sourcePath.toFile())
			?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read image")
		
		val originalWidth = originalImage.width
		val originalHeight = originalImage.height
		
		// 새 크기 계산
		val (newWidth, newHeight) = calculateNewSize(
			originalWidth, originalHeight, request
		)
		
		// 알고리즘별 리사이징
		val resizedImage = when (request.algorithm) {
			ResizeAlgorithm.LANCZOS -> {
				// Lanczos3: 최고 품질, 가장 느림
				resizeLanczos(originalImage, newWidth, newHeight, 3)
			}
			ResizeAlgorithm.BICUBIC -> {
				// Bicubic: 고품질
				resizeWithHint(
					originalImage, newWidth, newHeight,
					RenderingHints.VALUE_INTERPOLATION_BICUBIC
				)
			}
			ResizeAlgorithm.PROGRESSIVE_BILINEAR -> {
				// Progressive Bilinear: 점진적 축소로 품질 향상
				resizeProgressive(originalImage, newWidth, newHeight)
			}
			ResizeAlgorithm.BILINEAR -> {
				// Bilinear: 빠르고 품질 적당
				resizeWithHint(
					originalImage, newWidth, newHeight,
					RenderingHints.VALUE_INTERPOLATION_BILINEAR
				)
			}
			ResizeAlgorithm.NEAREST_NEIGHBOR -> {
				// Nearest Neighbor: 가장 빠름, 품질 낮음 (픽셀아트용)
				resizeWithHint(
					originalImage, newWidth, newHeight,
					RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR
				)
			}
		}
		
		// 출력 포맷 결정
		val outputFormat = request.outputFormat
			?: detectFormat(sourceFileName)
		
		val base64 = encodeToBase64(resizedImage, outputFormat, request.quality)
		val mimeType = getMimeType(outputFormat)
		
		return ResizeResponse(
			base64 = base64,
			mimeType = mimeType,
			width = newWidth,
			height = newHeight,
			algorithm = request.algorithm.name,
		)
	}
	
	private fun calculateNewSize(
		originalWidth: Int,
		originalHeight: Int,
		request: ResizeRequest
	): Pair<Int, Int> {
		// 퍼센트로 지정된 경우
		if (request.scalePercent != null) {
			val scale = request.scalePercent / 100.0
			return Pair(
				(originalWidth * scale).roundToInt(),
				(originalHeight * scale).roundToInt()
			)
		}
		
		val targetWidth = request.width
		val targetHeight = request.height
		
		if (targetWidth == null && targetHeight == null) {
			throw ResponseStatusException(
				HttpStatus.BAD_REQUEST,
				"Either width, height, or scalePercent must be specified"
			)
		}
		
		if (!request.maintainAspectRatio) {
			return Pair(
				targetWidth ?: originalWidth,
				targetHeight ?: originalHeight
			)
		}
		
		// 비율 유지
		val aspectRatio = originalWidth.toDouble() / originalHeight.toDouble()
		
		return when {
			targetWidth != null && targetHeight != null -> {
				// 둘 다 지정: fit within bounds
				val scaleW = targetWidth.toDouble() / originalWidth
				val scaleH = targetHeight.toDouble() / originalHeight
				val scale = min(scaleW, scaleH)
				Pair(
					(originalWidth * scale).roundToInt(),
					(originalHeight * scale).roundToInt()
				)
			}
			targetWidth != null -> {
				Pair(targetWidth, (targetWidth / aspectRatio).roundToInt())
			}
			else -> {
				Pair((targetHeight!! * aspectRatio).roundToInt(), targetHeight)
			}
		}
	}
	
	private fun resizeWithHint(
		source: BufferedImage,
		width: Int,
		height: Int,
		interpolation: Any
	): BufferedImage {
		val resized = BufferedImage(width, height, getImageType(source))
		val g2d = resized.createGraphics()
		
		g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, interpolation)
		g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY)
		g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
		
		g2d.drawImage(source, 0, 0, width, height, null)
		g2d.dispose()
		
		return resized
	}
	
	/**
	 * Progressive bilinear: 점진적으로 절반씩 줄여서 품질 향상
	 */
	private fun resizeProgressive(
		source: BufferedImage,
		targetWidth: Int,
		targetHeight: Int
	): BufferedImage {
		var current = source
		var currentWidth = source.width
		var currentHeight = source.height
		
		// 목표 크기의 2배 이상이면 절반씩 줄임
		while (currentWidth > targetWidth * 2 && currentHeight > targetHeight * 2) {
			currentWidth /= 2
			currentHeight /= 2
			current = resizeWithHint(
				current, currentWidth, currentHeight,
				RenderingHints.VALUE_INTERPOLATION_BILINEAR
			)
		}
		
		// 마지막 리사이즈
		return resizeWithHint(
			current, targetWidth, targetHeight,
			RenderingHints.VALUE_INTERPOLATION_BILINEAR
		)
	}
	
	/**
	 * Lanczos resampling - 고품질 다운스케일링
	 */
	private fun resizeLanczos(
		source: BufferedImage,
		targetWidth: Int,
		targetHeight: Int,
		a: Int = 3  // Lanczos parameter (보통 2 또는 3)
	): BufferedImage {
		val result = BufferedImage(targetWidth, targetHeight, getImageType(source))
		
		val scaleX = source.width.toDouble() / targetWidth
		val scaleY = source.height.toDouble() / targetHeight
		
		for (y in 0 until targetHeight) {
			for (x in 0 until targetWidth) {
				val srcX = (x + 0.5) * scaleX - 0.5
				val srcY = (y + 0.5) * scaleY - 0.5
				
				var r = 0.0
				var g = 0.0
				var b = 0.0
				var alpha = 0.0
				var weightSum = 0.0
				
				val x0 = max(0, floor(srcX - a).toInt())
				val x1 = min(source.width - 1, ceil(srcX + a).toInt())
				val y0 = max(0, floor(srcY - a).toInt())
				val y1 = min(source.height - 1, ceil(srcY + a).toInt())
				
				for (sy in y0..y1) {
					for (sx in x0..x1) {
						val weight = lanczosKernel(srcX - sx, a) * lanczosKernel(srcY - sy, a)
						if (weight != 0.0) {
							val pixel = source.getRGB(sx, sy)
							alpha += ((pixel shr 24) and 0xFF) * weight
							r += ((pixel shr 16) and 0xFF) * weight
							g += ((pixel shr 8) and 0xFF) * weight
							b += (pixel and 0xFF) * weight
							weightSum += weight
						}
					}
				}
				
				if (weightSum > 0) {
					val finalAlpha = clamp((alpha / weightSum).roundToInt(), 0, 255)
					val finalR = clamp((r / weightSum).roundToInt(), 0, 255)
					val finalG = clamp((g / weightSum).roundToInt(), 0, 255)
					val finalB = clamp((b / weightSum).roundToInt(), 0, 255)
					
					result.setRGB(x, y, (finalAlpha shl 24) or (finalR shl 16) or (finalG shl 8) or finalB)
				}
			}
		}
		
		return result
	}
	
	private fun lanczosKernel(x: Double, a: Int): Double {
		if (x == 0.0) return 1.0
		if (x < -a || x > a) return 0.0
		val px = PI * x
		return (a * sin(px) * sin(px / a)) / (px * px)
	}
	
	private fun clamp(value: Int, min: Int, max: Int): Int =
		max(min, min(max, value))
	
	private fun getImageType(image: BufferedImage): Int {
		return if (image.colorModel.hasAlpha()) {
			BufferedImage.TYPE_INT_ARGB
		} else {
			BufferedImage.TYPE_INT_RGB
		}
	}
	
	private fun detectFormat(fileName: String): OutputFormat {
		val ext = fileName.substringAfterLast(".", "").lowercase()
		return when (ext) {
			"jpg", "jpeg" -> OutputFormat.JPEG
			"png" -> OutputFormat.PNG
			"webp" -> OutputFormat.WEBP
			"gif" -> OutputFormat.GIF
			else -> OutputFormat.PNG
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
	
	private fun encodeToBase64(
		image: BufferedImage,
		format: OutputFormat,
		quality: Int
	): String {
		val baos = ByteArrayOutputStream()
		
		val formatName = when (format) {
			OutputFormat.JPEG -> "jpeg"
			OutputFormat.PNG -> "png"
			OutputFormat.WEBP -> "webp"
			OutputFormat.GIF -> "gif"
		}
		
		// JPEG, WebP는 품질 설정 가능
		if (format == OutputFormat.JPEG || format == OutputFormat.WEBP) {
			val writers = ImageIO.getImageWritersByFormatName(formatName)
			if (writers.hasNext()) {
				val writer = writers.next()
				val param = writer.defaultWriteParam
				
				if (param.canWriteCompressed()) {
					param.compressionMode = ImageWriteParam.MODE_EXPLICIT
					param.compressionQuality = quality / 100f
				}
				
				val ios = ImageIO.createImageOutputStream(baos)
				writer.output = ios
				
				// JPEG는 알파 채널 제거
				val outputImage = if (format == OutputFormat.JPEG && image.colorModel.hasAlpha()) {
					val rgb = BufferedImage(image.width, image.height, BufferedImage.TYPE_INT_RGB)
					val g = rgb.createGraphics()
					g.drawImage(image, 0, 0, java.awt.Color.WHITE, null)
					g.dispose()
					rgb
				} else {
					image
				}
				
				writer.write(null, IIOImage(outputImage, null, null), param)
				ios.close()
				writer.dispose()
				
				return Base64.getEncoder().encodeToString(baos.toByteArray())
			}
		}
		
		// PNG, GIF 또는 fallback
		ImageIO.write(image, formatName, baos)
		return Base64.getEncoder().encodeToString(baos.toByteArray())
	}
}
