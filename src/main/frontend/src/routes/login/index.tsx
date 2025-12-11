import { useState } from "react";
import { useNavigate } from "react-router";
import type { FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch("http://localhost:8080/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setError(errorData.message || "로그인에 실패했습니다.");
				return;
			}

			const data = await response.json();
			login(data.token, data.username);
			navigate("/");
		} catch (err) {
			setError("서버 연결에 실패했습니다.");
		}
	};

	return (
		<div style={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			minHeight: "100vh",
			backgroundColor: "#f5f5f5"
		}}>
			<div style={{
				backgroundColor: "white",
				padding: "40px",
				borderRadius: "8px",
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
				width: "400px"
			}}>
				<h1 style={{ textAlign: "center", marginBottom: "30px" }}>로그인</h1>
				
				{error && (
					<div style={{
						backgroundColor: "#fee",
						color: "#c33",
						padding: "10px",
						borderRadius: "4px",
						marginBottom: "20px",
						textAlign: "center"
					}}>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "20px" }}>
						<label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
							아이디
						</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							style={{
								width: "100%",
								padding: "10px",
								border: "1px solid #ddd",
								borderRadius: "4px",
								fontSize: "14px"
							}}
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
							비밀번호
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							style={{
								width: "100%",
								padding: "10px",
								border: "1px solid #ddd",
								borderRadius: "4px",
								fontSize: "14px"
							}}
						/>
					</div>

					<button
						type="submit"
						style={{
							width: "100%",
							padding: "12px",
							backgroundColor: "#007bff",
							color: "white",
							border: "none",
							borderRadius: "4px",
							fontSize: "16px",
							fontWeight: "500",
							cursor: "pointer",
							marginBottom: "15px"
						}}
					>
						로그인
					</button>

					<div style={{ textAlign: "center" }}>
						<span style={{ color: "#666", fontSize: "14px" }}>
							계정이 없으신가요?{" "}
						</span>
						<a
							href="/register"
							style={{
								color: "#007bff",
								textDecoration: "none",
								fontSize: "14px",
								fontWeight: "500"
							}}
						>
							회원가입
						</a>
					</div>
				</form>
			</div>
		</div>
	);
}
