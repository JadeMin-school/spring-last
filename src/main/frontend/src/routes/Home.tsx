import { useEffect, useState } from 'react';


export default function App() {
	const [hello, setHello] = useState("");

	useEffect(() => {
		fetch("/api/hello")
			.then(res => res.text())
			.then(data => setHello(data));
	}, []);


	return (
		<div>
			<p>리액트로 스프링에서 가져온 데이터 : { hello }</p>
		</div>
	);
}