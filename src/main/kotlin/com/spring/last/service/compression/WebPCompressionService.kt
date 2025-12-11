package com.spring.last.service.compression

import com.spring.last.dto.CompressRequest
import org.springframework.stereotype.Service
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.IIOImage
import javax.imageio.ImageIO
import javax.imageio.ImageWriteParam

@Service
class WebPCompressionService {
	fun compress(image: BufferedImage, request: CompressRequest): ByteArray {
		val output = ByteArrayOutputStream()
		
		// TwelveMonkeys/Sejda WebP Writer
		val writer = ImageIO.getImageWritersByFormatName("webp").next()
		val ios = ImageIO.createImageOutputStream(output)
		writer.output = ios
		
		val writeParam = writer.defaultWriteParam
		if (writeParam.canWriteCompressed()) {
			configureWebPCompression(writeParam, request)
		}
		
		writer.write(null, IIOImage(image, null, null), writeParam)
		writer.dispose()
		ios.close()
		
		return output.toByteArray()
	}
	
	private fun configureWebPCompression(writeParam: ImageWriteParam, request: CompressRequest) {
		writeParam.compressionMode = ImageWriteParam.MODE_EXPLICIT
		
		val isLossless = request.method.name.contains("VP8L")
		writeParam.compressionType = if (isLossless) "Lossless" else "Lossy"
		
		if (!isLossless) {
			writeParam.compressionQuality = (request.quality / 100f).coerceIn(0f, 1f)
		}
	}
}
