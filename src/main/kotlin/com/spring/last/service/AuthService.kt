package com.spring.last.service

import com.spring.last.dto.AuthResponse
import com.spring.last.dto.LoginRequest
import com.spring.last.dto.RegisterRequest
import com.spring.last.entity.User
import com.spring.last.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    fun register(request: RegisterRequest): AuthResponse {
        // 중복 체크
        if (userRepository.existsByUsername(request.username)) {
            throw IllegalArgumentException("Username already exists")
        }
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email already exists")
        }

        // 사용자 생성
        val user = User().apply {
            username = request.username
            password = passwordEncoder.encode(request.password)
            email = request.email
        }

        val savedUser = userRepository.save(user)

        // JWT 토큰 생성
        val token = jwtService.generateToken(savedUser.username!!)

        return AuthResponse(
            token = token,
            username = savedUser.username!!,
            email = savedUser.email!!
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByUsername(request.username)
            ?: throw IllegalArgumentException("Invalid username or password")

        if (user.password == null || !passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid username or password")
        }

        val token = jwtService.generateToken(user.username!!)

        return AuthResponse(
            token = token,
            username = user.username!!,
            email = user.email!!
        )
    }

    fun getUserByUsername(username: String): User? {
        return userRepository.findByUsername(username)
    }
}
