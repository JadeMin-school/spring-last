package com.spring.last.dto

data class LoginRequest(
	val username: String,
	val password: String
)

data class RegisterRequest(
	val username: String,
	val password: String,
	val email: String
)

data class AuthResponse(
	val token: String,
	val username: String,
	val email: String
)

data class ErrorResponse(
	val message: String
)
