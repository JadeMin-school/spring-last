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
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("tools.jackson.module:jackson-module-kotlin")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
	}
}

tasks.processResources {
	dependsOn("copyReactOutput")
}


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