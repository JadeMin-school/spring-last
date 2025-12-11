package com.spring.last.service

import com.spring.last.dto.ImageInfo
import com.spring.last.dto.ImageResponse
import org.springframework.core.io.FileSystemResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.Path
import java.util.*
import javax.imageio.ImageIO

@Service
class ImageService {
	private val uploadDir: Path = Path.of("uploads").toAbsolutePath()
	
	init {
		Files.createDirectories(uploadDir)
	}
	
	fun saveImage(file: MultipartFile): ImageResponse {
		val ext =
			file.originalFilename?.substringAfterLast(
				".",
				"",
			) ?: "png"
		val fileName = "${UUID.randomUUID()}.${ext}"
		
		file.transferTo(uploadDir.resolve(fileName))
		
		return ImageResponse(fileName)
	}
	
	fun loadImage(fileName: String): Resource {
		val path = resolvePath(fileName)
		return FileSystemResource(path)
	}
	
	fun getImageInfo(fileName: String): ImageInfo {
		val path = resolvePath(fileName)
		val image = ImageIO.read(path.toFile())
			?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read image")
		
		val format = fileName.substringAfterLast(".", "").uppercase()
		
		return ImageInfo(
			fileName = fileName,
			width = image.width,
			height = image.height,
			format = format,
			fileSizeBytes = Files.size(path)
		)
	}
	
	private fun resolvePath(fileName: String): Path {
		val path = uploadDir.resolve(fileName).normalize()
		
		if (!path.startsWith(uploadDir))
			throw ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied")
		
		if (!Files.exists(path))
			throw ResponseStatusException(HttpStatus.NOT_FOUND, "File not found")
		
		return path
	}
}