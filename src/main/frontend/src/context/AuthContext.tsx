import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
	isAuthenticated: boolean;
	username: string | null;
	token: string | null;
	login: (token: string, username: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		// 초기 로드 시 localStorage에서 토큰 확인
		const savedToken = localStorage.getItem("token");
		const savedUsername = localStorage.getItem("username");
		
		if (savedToken && savedUsername) {
			setToken(savedToken);
			setUsername(savedUsername);
		}
	}, []);

	const login = (newToken: string, newUsername: string) => {
		localStorage.setItem("token", newToken);
		localStorage.setItem("username", newUsername);
		setToken(newToken);
		setUsername(newUsername);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		setToken(null);
		setUsername(null);
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!token,
				username,
				token,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
