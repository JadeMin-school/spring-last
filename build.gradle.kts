plugins {
	kotlin("jvm") version "2.2.21"
	kotlin("plugin.spring") version "2.2.21"
	id("org.springframework.boot") version "4.0.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.spring"
version = "0.0.0"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(24)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	
	// MySQL
	runtimeOnly("com.mysql:mysql-connector-j")
	
	// JWT
	implementation("io.jsonwebtoken:jjwt-api:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
	
	// 이미지 처리 - TwelveMonkeys (고급 포맷 지원)
	implementation("com.twelvemonkeys.imageio:imageio-core:3.12.0")
	implementation("com.twelvemonkeys.imageio:imageio-jpeg:3.12.0")
	implementation("com.twelvemonkeys.imageio:imageio-webp:3.12.0")
	implementation("com.twelvemonkeys.imageio:imageio-metadata:3.12.0")
	
	// Thumbnailator - 고품질 리사이징 및 이미지 처리
	implementation("net.coobird:thumbnailator:0.4.20")
	
	// WebP 고급 압축 (Google 공식)
	implementation("org.sejda.imageio:webp-imageio:0.1.6")
	
	// Apache Commons Imaging - 다양한 포맷 및 메타데이터 처리
	implementation("org.apache.commons:commons-imaging:1.0.0-alpha5")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
	}
}

/*
tasks.processResources {
	dependsOn("cpoyReactOuput")
}
*/


val frontendDir = "$projectDir/src/main/frontend"

tasks.register<Exec>("installReact") {
	workingDir = file(frontendDir)
	commandLine = listOf("cmd", "/c", "pnpm", "install")
}
tasks.register<Exec>("buildReact") {
	workingDir = file(frontendDir)
	commandLine = listOf("cmd", "/c", "pnpm", "run", "build")
	
	dependsOn("installReact")
}
tasks.register<Copy>("copyReactOutput") {
	delete("$projectDir/src/main/resources/static")
	from("$frontendDir/dist")
	into("$projectDir/src/main/resources/static")
	
	dependsOn("buildReact")
}