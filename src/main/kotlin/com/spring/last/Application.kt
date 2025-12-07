package com.spring.last

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LastApplication


fun main(args: Array<String>) {
	runApplication<LastApplication>(*args)
}