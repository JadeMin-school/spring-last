import { useState, useEffect } from "react";
import { Link } from "react-router";
import Navbar from "../../components/Navbar";
import { projectStorage } from "../../utils/projectStorage";
import type { Project } from "../../utils/projectStorage";

export default function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

	useEffect(() => {
		loadProjects();
	}, []);

	const loadProjects = async () => {
		const allProjects = projectStorage.getAll();
		setProjects(allProjects.sort((a, b) => 
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		));
		
		// 각 프로젝트의 원본 이미지 썸네일 로드
		const thumbs: Record<string, string> = {};
		const token = localStorage.getItem('token');
		const headers: HeadersInit = {};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		
		for (const project of allProjects) {
			try {
				const response = await fetch(`http://localhost:8080/api/image/${project.originalFileName}`, { headers });
				const blob = await response.blob();
				thumbs[project.id] = URL.createObjectURL(blob);
			} catch (err) {
				console.error(`썸네일 로드 실패 (${project.id}):`, err);
			}
		}
		setThumbnails(thumbs);
	};

	const handleDelete = (id: string, name: string) => {
		if (confirm(`"${name}" 프로젝트를 삭제하시겠습니까?`)) {
			projectStorage.delete(id);
			loadProjects();
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	};

	return (
		<div className="container">
			<Navbar />
			
			<h1>내 프로젝트</h1>

			{projects.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
					<p style={{ fontSize: '18px', marginBottom: '20px' }}>저장된 프로젝트가 없습니다</p>
					<Link to="/upload" style={{
						display: 'inline-block',
						padding: '10px 20px',
						backgroundColor: '#007bff',
						color: 'white',
						textDecoration: 'none',
						borderRadius: '4px'
					}}>
						새 이미지 업로드
					</Link>
				</div>
			) : (
				<div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
					gap: '20px',
					marginTop: '20px'
				}}>
					{projects.map(project => (
						<div key={project.id} style={{
							border: '1px solid #ddd',
							borderRadius: '8px',
							overflow: 'hidden',
							backgroundColor: 'white',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
							transition: 'transform 0.2s',
						}}>
							<Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
								<div style={{
									width: '100%',
									height: '200px',
									backgroundColor: '#f5f5f5',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									overflow: 'hidden'
								}}>
									{thumbnails[project.id] ? (
										<img 
											src={thumbnails[project.id]} 
											alt={project.name}
											style={{
												maxWidth: '100%',
												maxHeight: '100%',
												objectFit: 'contain'
											}}
										/>
									) : (
										<div style={{ color: '#999' }}>로딩 중...</div>
									)}
								</div>
								
								<div style={{ padding: '15px' }}>
									<h3 style={{ 
										margin: '0 0 8px 0', 
										fontSize: '16px',
										fontWeight: '600',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									}}>
										{project.name}
									</h3>
									
									<p style={{ 
										margin: '0 0 8px 0',
										fontSize: '13px',
										color: '#666',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									}}>
										{project.originalFileName}
									</p>
									
									<p style={{ 
										margin: '0',
										fontSize: '12px',
										color: '#999'
									}}>
										{formatDate(project.updatedAt)}
									</p>
								</div>
							</Link>
							
							<div style={{ 
								padding: '10px 15px',
								borderTop: '1px solid #eee',
								display: 'flex',
								gap: '10px'
							}}>
								<Link 
									to={`/project/${project.id}`}
									style={{
										flex: 1,
										padding: '8px',
										backgroundColor: '#007bff',
										color: 'white',
										textAlign: 'center',
										textDecoration: 'none',
										borderRadius: '4px',
										fontSize: '14px'
									}}
								>
									편집
								</Link>
								<button
									onClick={() => handleDelete(project.id, project.name)}
									style={{
										flex: 1,
										padding: '8px',
										backgroundColor: '#dc3545',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										fontSize: '14px',
										cursor: 'pointer'
									}}
								>
									삭제
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
