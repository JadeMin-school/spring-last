import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';


export default function Upload() {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { token } = useAuth();

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);
		const form = new FormData();
		form.append("file", file);

		try {
			const headers: HeadersInit = {};
			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}

			const response = await fetch("/api/upload", {
				method: "POST",
				headers,
				body: form,
			});

			if (!response.ok) {
				if (response.status === 401) {
					alert("로그인이 필요합니다.");
					navigate("/login");
					return;
				}
				
				// 서버 오류 메시지 파싱
				const errorText = await response.text().catch(() => null);
				const errorMessage = errorText || `업로드 실패 (${response.status})`;
				throw new Error(errorMessage);
			}

			const json = await response.json();
			navigate(`/editor/${json.fileName}`);
		} catch (error) {
			console.error("Upload error:", error);
			if (error instanceof Error && !error.message.includes('401')) {
				alert(`업로드 실패: ${error.message}`);
			}
		} finally {
			setLoading(false);
		}
	};


	return (
		<div className="container">
			<Navbar />
			
			<h1>이미지 업로드</h1>
			
			<div className="column">
				<div className="field">
					<label>파일 선택</label>
					<input
						type="file"
						accept="image/*"
						onChange={e => setFile(e.target.files?.[0] ?? null)}
					/>
				</div>
				
				{file && (
					<p>선택된 파일: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
				)}
				
				<div>
					<button onClick={handleUpload} disabled={!file || loading}>
						{loading ? "업로드 중..." : "업로드"}
					</button>
				</div>
			</div>
		</div>
	);
}