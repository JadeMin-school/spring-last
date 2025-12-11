import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, username, logout } = useAuth();
	const isHome = location.pathname === '/';

	const handleLogout = () => {
		logout();
		navigate('/');
	};
	
	return (
		<nav style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '10px 20px',
			borderBottom: '1px solid #ddd',
			marginBottom: '20px'
		}}>
			<div style={{ display: 'flex', gap: '15px' }}>
				{!isHome && <Link to="/">← 홈</Link>}
				<Link to="/upload">업로드</Link>
				<Link to="/projects">프로젝트</Link>
			</div>
			
			<div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
				{isAuthenticated ? (
					<>
						<span style={{ color: '#666', fontSize: '14px' }}>
							{username}님
						</span>
						<button
							onClick={handleLogout}
							style={{
								padding: '5px 15px',
								backgroundColor: '#dc3545',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '14px'
							}}
						>
							로그아웃
						</button>
					</>
				) : (
					<>
						<Link to="/login">로그인</Link>
						<Link to="/register">회원가입</Link>
					</>
				)}
			</div>
		</nav>
	);
}
