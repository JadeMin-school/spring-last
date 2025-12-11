package com.spring.last.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	var id: Long? = null,
	
	@Column(unique = true, nullable = false, length = 50)
	var username: String? = null,
	
	@Column(nullable = false)
	var password: String? = null,
	
	@Column(unique = true, nullable = false, length = 100)
	var email: String? = null,
	
	@Column(name = "created_at", updatable = false)
	var createdAt: LocalDateTime = LocalDateTime.now(),
	
	@Column(name = "updated_at")
	var updatedAt: LocalDateTime = LocalDateTime.now()
)
