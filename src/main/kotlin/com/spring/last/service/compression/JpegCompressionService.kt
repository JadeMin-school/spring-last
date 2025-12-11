package com.spring.last.service.compression

import com.spring.last.dto.CompressRequest
import net.coobird.thumbnailator.Thumbnails
import org.springframework.stereotype.Service
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.IIOImage
import javax.imageio.ImageIO
import javax.imageio.ImageWriteParam
import javax.imageio.plugins.jpeg.JPEGImageWriteParam

@Service
class JpegCompressionService {
	fun compress(image: BufferedImage, request: CompressRequest): ByteArray {
		val output = ByteArrayOutputStream()
		
		val rgbImage = convertToRgb(image)
		
		// 스무딩 적용 (Thumbnailator)
		val processedImage = if (request.smoothingFactor > 0) {
			val blurStrength = (request.smoothingFactor / 100.0).coerceIn(0.0, 1.0)
			Thumbnails.of(rgbImage)
				.size(rgbImage.width, rgbImage.height)
				.outputQuality(1.0 - blurStrength * 0.3) // 약간의 품질 감소로 블러 효과
				.asBufferedImage()
		} else rgbImage
		
		// TwelveMonkeys JPEG Writer
		val writer = ImageIO.getImageWritersByFormatName("jpeg").next()
		val ios = ImageIO.createImageOutputStream(output)
		writer.output = ios
		
		val writeParam = (writer.defaultWriteParam as JPEGImageWriteParam).apply {
			compressionMode = ImageWriteParam.MODE_EXPLICIT
			compressionQuality = calculateQuality(request).coerceIn(0.0f, 1.0f)
			optimizeHuffmanTables = shouldOptimizeHuffman(request)
			
			if (request.progressive) {
				progressiveMode = ImageWriteParam.MODE_DEFAULT
			}
		}
		
		writer.write(null, IIOImage(processedImage, null, null), writeParam)
		writer.dispose()
		ios.close()
		
		return output.toByteArray()
	}
	
	private fun convertToRgb(image: BufferedImage): BufferedImage {
		return if (image.type == BufferedImage.TYPE_INT_ARGB || image.type == BufferedImage.TYPE_INT_ARGB_PRE) {
			BufferedImage(image.width, image.height, BufferedImage.TYPE_INT_RGB).apply {
				createGraphics().apply {
					drawImage(image, 0, 0, null)
					dispose()
				}
			}
		} else image
	}
	
	private fun calculateQuality(request: CompressRequest): Float {
		val baseQuality = request.quality / 100f
		return when (request.method.name) {
			"HUFFMAN" -> baseQuality
			"DCT" -> (baseQuality * 1.05f).coerceAtMost(1.0f)
			"ARITHMETIC" -> (baseQuality * 0.95f).coerceAtLeast(0.1f)
			else -> baseQuality
		}
	}
	
	private fun shouldOptimizeHuffman(request: CompressRequest): Boolean {
		return when (request.method.name) {
			"HUFFMAN", "ARITHMETIC" -> true
			"DCT" -> false
			else -> request.optimize
		}
	}
}
