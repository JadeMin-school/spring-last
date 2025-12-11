/**
 * 파일 크기를 자동으로 적절한 단위(B, KB, MB)로 포맷팅
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 압축률을 포맷팅 (소수점 1자리)
 */
export function formatCompressionRatio(ratio: number): string {
	return `${ratio.toFixed(1)}%`;
}

/**
 * 이미지 크기를 포맷팅 (width × height)
 */
export function formatImageDimensions(width: number, height: number): string {
	return `${width} × ${height}px`;
}
