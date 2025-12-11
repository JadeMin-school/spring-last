import Navbar from '../../components/Navbar';


export default function Home() {
	return (
		<div className="container">
			<Navbar />
			<h1>이미지 편집 도구</h1>
			<p>이미지 리사이즈, 압축, 크롭 등 다양한 처리를 할 수 있습니다.</p>
		</div>
	);
}