import { Link, useLocation } from 'react-router';

export default function Navbar() {
	const location = useLocation();
	const isHome = location.pathname === '/';
	
	return (
		<nav>
			{!isHome && <Link to="/">← 홈</Link>}
			<Link to="/upload">업로드</Link>
		</nav>
	);
}
