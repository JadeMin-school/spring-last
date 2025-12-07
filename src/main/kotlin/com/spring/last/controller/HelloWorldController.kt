package com.spring.last.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController


@RestController
class HelloWorldController {
	@GetMapping("/api/hello")
	fun test(): String {
		return "Hello, World!"
	}
}