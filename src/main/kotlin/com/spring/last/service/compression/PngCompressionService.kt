package com.spring.last.service.compression

import com.spring.last.dto.CompressRequest
import org.springframework.stereotype.Service
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@Service
class PngCompressionService {
	fun compress(image: BufferedImage, request: CompressRequest): ByteArray {
		val output = ByteArrayOutputStream()
		
		// PNG는 무손실 압축이므로 기본 ImageIO 사용
		ImageIO.write(image, "png", output)
		
		return output.toByteArray()
	}
}
