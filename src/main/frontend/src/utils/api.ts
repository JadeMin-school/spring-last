/**
 * API 호출 유틸리티
 */

export async function fetchImageInfo(fileName: string) {
	const response = await fetch(`/api/info/${fileName}`);
	if (!response.ok) throw new Error('Failed to fetch image info');
	return response.json();
}

export async function executeResize(fileName: string, body: Record<string, unknown>) {
	const response = await fetch(`/api/resize/${fileName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	
	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.message || `Error: ${response.status}`);
	}
	
	return response.json();
}

export async function executeCompress(fileName: string, body: Record<string, unknown>) {
	const response = await fetch(`/api/compress/${fileName}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	
	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.message || `Error: ${response.status}`);
	}
	
	return response.json();
}
