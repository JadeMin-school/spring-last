package com.spring.last.service.compression

import com.spring.last.dto.CompressRequest
import org.apache.commons.imaging.ImageFormats
import org.apache.commons.imaging.Imaging
import org.springframework.stereotype.Service
import java.awt.image.BufferedImage

@Service
class GifCompressionService {
	fun compress(image: BufferedImage, request: CompressRequest): ByteArray {
		val output = java.io.ByteArrayOutputStream()
		
		val processedImage = convertToRgb(image)
		
		// Apache Commons Imaging으로 GIF 저장 (자동으로 LZW 압축 사용)
		Imaging.writeImage(processedImage, output, ImageFormats.GIF)
		
		return output.toByteArray()
	}
	
	private fun convertToRgb(image: BufferedImage): BufferedImage {
		return if (image.type == BufferedImage.TYPE_INT_RGB) {
			image
		} else {
			BufferedImage(image.width, image.height, BufferedImage.TYPE_INT_RGB).apply {
				createGraphics().apply {
					drawImage(image, 0, 0, null)
					dispose()
				}
			}
		}
	}
}
