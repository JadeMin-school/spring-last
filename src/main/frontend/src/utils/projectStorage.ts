export interface Project {
	id: string;
	name: string;
	originalFileName: string; // 원본 파일명 (API 접근용)
	settings?: {
		format?: string;
		quality?: number;
		algorithm?: string;
		width?: number;
		height?: number;
		method?: string;
		targetSizeKB?: number;
	};
	createdAt: string;
	updatedAt: string;
}

const PROJECTS_KEY = 'image-projects';

export const projectStorage = {
	getAll(): Project[] {
		const data = localStorage.getItem(PROJECTS_KEY);
		return data ? JSON.parse(data) : [];
	},

	getById(id: string): Project | null {
		const projects = this.getAll();
		return projects.find(p => p.id === id) || null;
	},

	save(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
		const projects = this.getAll();
		const newProject: Project = {
			...project,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		projects.push(newProject);
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
		return newProject;
	},

	update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
		const projects = this.getAll();
		const index = projects.findIndex(p => p.id === id);
		if (index === -1) return null;

		projects[index] = {
			...projects[index],
			...updates,
			updatedAt: new Date().toISOString(),
		};
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
		return projects[index];
	},

	delete(id: string): boolean {
		const projects = this.getAll();
		const filtered = projects.filter(p => p.id !== id);
		if (filtered.length === projects.length) return false;
		localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
		return true;
	},

	clear(): void {
		localStorage.removeItem(PROJECTS_KEY);
	}
};
