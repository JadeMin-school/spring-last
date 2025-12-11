import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Navbar from '../../components/Navbar';
import ImagePanel from '../../components/ImagePanel';
import type * as Types from '../../types';
import { getAvailableMethodsForFormat, getDefaultMethodForFormat, COMPRESSION_METHOD_LABELS } from '../../utils/compression';
import { formatFileSize } from '../../utils/format';
import { fetchImageInfo, executeResize, executeCompress } from '../../utils/api';
import { projectStorage } from '../../utils/projectStorage';

type ResizeAlgorithm = Types.ResizeAlgorithm;
type OutputFormat = Types.OutputFormat;
type CompressionMethod = Types.CompressionMethod;
type ImageInfo = Types.ImageInfo;
type Result = Types.Result;

// ResizeTab 컴포넌트
function ResizeTab({
	originalFile: _originalFile,
	originalInfo,
	onExecute,
	loading,
	error,
	onValidationChange
}: {
	originalFile: string;
	originalInfo: ImageInfo | null;
	onExecute: (body: Record<string, unknown>) => void;
	loading: boolean;
	error: string | null;
	onValidationChange?: (valid: boolean, execute: () => void) => void;
}) {
	const [sizeMode, setSizeMode] = useState<'dimensions' | 'percent'>('dimensions');
	const [width, setWidth] = useState<number | ''>('');
	const [height, setHeight] = useState<number | ''>('');
	const [scalePercent, setScalePercent] = useState<number>(50);
	const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
	const [algorithm, setAlgorithm] = useState<ResizeAlgorithm>('LANCZOS');
	const [outputFormat, setOutputFormat] = useState<OutputFormat | ''>('');
	const [quality, setQuality] = useState(100);
	
	const aspectRatio = originalInfo ? originalInfo.width / originalInfo.height : 1;
	
	useEffect(() => {
		if (originalInfo) {
			setWidth(originalInfo.width);
			setHeight(originalInfo.height);
		}
	}, [originalInfo]);
	
	const handleWidthChange = (newWidth: number | '') => {
		setWidth(newWidth);
		if (maintainAspectRatio && newWidth && originalInfo) {
			setHeight(Math.round(newWidth / aspectRatio));
		}
	};
	
	const handleHeightChange = (newHeight: number | '') => {
		setHeight(newHeight);
		if (maintainAspectRatio && newHeight && originalInfo) {
			setWidth(Math.round(newHeight * aspectRatio));
		}
	};
	
	const canResize = sizeMode === 'percent' || width || height;
	
	const resizeValidationError = !canResize 
		? '너비, 높이, 또는 퍼센트 중 하나는 지정해야 합니다.' 
		: null;
	
	useEffect(() => {
		if (onValidationChange) {
			onValidationChange(canResize, handleResize);
		}
	}, [canResize, width, height, scalePercent, algorithm, outputFormat, quality, maintainAspectRatio, sizeMode]);
	
	const handleResize = () => {
		const body: Record<string, unknown> = {
			algorithm,
			maintainAspectRatio,
			quality,
		};
		
		if (sizeMode === 'percent') {
			body.scalePercent = scalePercent;
		} else {
			if (width) body.width = width;
			if (height) body.height = height;
		}
		
		if (outputFormat) {
			body.outputFormat = outputFormat;
		}
		
		onExecute(body);
	};
	
	return (
		<div className="column">
			<div className="field">
				<label>크기 지정 방식</label>
				<div className="field-row">
					<label>
						<input
							type="radio"
							checked={sizeMode === 'dimensions'}
							onChange={() => setSizeMode('dimensions')}
						/>
						픽셀
					</label>
					<label>
						<input
							type="radio"
							checked={sizeMode === 'percent'}
							onChange={() => setSizeMode('percent')}
						/>
						퍼센트
					</label>
				</div>
			</div>
			
			{sizeMode === 'dimensions' ? (
				<div className="field-group">
					<div className="field">
						<label>너비 (px)</label>
						<input
							type="number"
							min={1}
							value={width}
							onChange={e => handleWidthChange(e.target.value ? Number(e.target.value) : '')}
							placeholder="auto"
						/>
					</div>
					<div className="field">
						<label>높이 (px)</label>
						<input
							type="number"
							min={1}
							value={height}
							onChange={e => handleHeightChange(e.target.value ? Number(e.target.value) : '')}
							placeholder="auto"
						/>
					</div>
				</div>
			) : (
				<div className="field">
					<label>스케일 (%)</label>
					<input
						type="number"
						min={1}
						max={100}
						value={scalePercent}
						onChange={e => setScalePercent(Number(e.target.value))}
					/>
				</div>
			)}
			
			{sizeMode === 'dimensions' && (
				<div className="field">
					<label>
						<input
							type="checkbox"
							checked={maintainAspectRatio}
							onChange={e => setMaintainAspectRatio(e.target.checked)}
						/>
						비율 유지
					</label>
				</div>
			)}
			
			<div className="field">
				<label>알고리즘</label>
				<select value={algorithm} onChange={e => setAlgorithm(e.target.value as ResizeAlgorithm)}>
					<option value="NEAREST_NEIGHBOR">Nearest Neighbor (빠름, 픽셀아트용)</option>
					<option value="BILINEAR">Bilinear (중간)</option>
					<option value="BICUBIC">Bicubic (고품질)</option>
					<option value="LANCZOS">Lanczos (최고품질, 다운스케일 최적)</option>
					<option value="PROGRESSIVE_BILINEAR">Progressive Bilinear (점진적 축소)</option>
				</select>
			</div>
			
			<div className="field-group">
				<div className="field">
					<label>출력 포맷</label>
					<select value={outputFormat} onChange={e => setOutputFormat(e.target.value as OutputFormat | '')}>
						<option value="">원본 유지</option>
						<option value="JPEG">JPEG</option>
						<option value="PNG">PNG</option>
						<option value="WEBP">WebP</option>
						<option value="GIF">GIF</option>
					</select>
				</div>
				
				{(outputFormat === 'JPEG' || outputFormat === 'WEBP' || 
				  (outputFormat === '' && originalInfo && (originalInfo.format === 'JPG' || originalInfo.format === 'JPEG' || originalInfo.format === 'WEBP'))) && (
					<div className="field">
						<label>품질 (1-100)</label>
						<input
							type="number"
							min={1}
							max={100}
							value={quality}
							onChange={e => setQuality(Number(e.target.value))}
						/>
					</div>
				)}
			</div>
			
			{resizeValidationError && <p style={{ color: 'orange' }}>{resizeValidationError}</p>}
		</div>
	);
}

// CompressTab 컴포넌트
function CompressTab({
	originalFile: _originalFile,
	originalInfo,
	onExecute,
	loading,
	error,
	onValidationChange
}: {
	originalFile: string;
	originalInfo: ImageInfo | null;
	onExecute: (body: Record<string, unknown>) => void;
	loading: boolean;
	error: string | null;
	onValidationChange?: (valid: boolean, execute: () => void) => void;
}) {
	// 출력 포맷을 먼저 선택
	const [outputFormat, setOutputFormat] = useState<OutputFormat | ''>('');
	
	// 포맷 결정 (원본 포맷도 고려)
	const actualFormat = (outputFormat || originalInfo?.format || '') as OutputFormat | '';
	const isJPEG = actualFormat === 'JPEG';
	const isPNG = actualFormat === 'PNG';
	const isWEBP = actualFormat === 'WEBP';
	const isGIF = actualFormat === 'GIF';
	
	// 포맷별 기본 알고리즘 설정
	const getDefaultMethod = (): CompressionMethod => {
		const format: OutputFormat = isJPEG ? 'JPEG' : isPNG ? 'PNG' : isWEBP ? 'WEBP' : isGIF ? 'GIF' : 'JPEG';
		return getDefaultMethodForFormat(format);
	};
	
	const [quality, setQuality] = useState(100);
	const [method, setMethod] = useState<CompressionMethod>(getDefaultMethod());
	const [targetSizeMode, setTargetSizeMode] = useState<'none' | 'kb' | 'mb' | 'percent'>('none');
	const [targetSizeValue, setTargetSizeValue] = useState<number | ''>('');
	
	// 공통 옵션
	const [optimize, setOptimize] = useState(true);
	const [stripMetadata, setStripMetadata] = useState(true);
	
	// JPEG 옵션 (Scrimage 지원)
	const [progressive, setProgressive] = useState(false);
	const [smoothingFactor, setSmoothingFactor] = useState(0);
	

	
	// 포맷 변경 시 적절한 알고리즘으로 자동 변경
	useEffect(() => {
		setMethod(getDefaultMethod());
	}, [actualFormat]);
	
	const handleCompress = () => {
		const body: Record<string, unknown> = {
			quality,
			method,
			maxIterations: 10,
			
			// 공통 옵션
			optimize,
			stripMetadata,
			
			// JPEG 옵션
			progressive,
			smoothingFactor,
		};
		
		if (outputFormat) {
			body.outputFormat = outputFormat;
		}
		
		// 목표 크기 계산
		if (targetSizeMode !== 'none' && targetSizeValue) {
			if (targetSizeMode === 'kb') {
				body.targetSizeKB = targetSizeValue;
			} else if (targetSizeMode === 'mb') {
				body.targetSizeKB = targetSizeValue * 1024;
			} else if (targetSizeMode === 'percent' && originalInfo) {
				const targetBytes = (originalInfo.fileSizeBytes * targetSizeValue) / 100;
				body.targetSizeKB = Math.round(targetBytes / 1024);
			}
		}
		
		onExecute(body);
	};
	
	const availableMethods = getAvailableMethodsForFormat(actualFormat);
	
	// 포맷 변경 시 알고리즘 자동 업데이트
	useEffect(() => {
		if (actualFormat) {
			const newDefaultMethod = getDefaultMethodForFormat(actualFormat);
			if (method !== newDefaultMethod && availableMethods.includes(newDefaultMethod)) {
				setMethod(newDefaultMethod);
			}
		}
	}, [actualFormat]);
	
	// 필수 입력 검증
	const canCompress = quality >= 1 && quality <= 100 && outputFormat !== '';
	const validationError = !outputFormat ? '출력 포맷을 먼저 선택하세요.' 
		: !canCompress ? '품질은 1-100 사이 값이어야 합니다.' 
		: (targetSizeMode !== 'none' && !targetSizeValue) ? '목표 크기를 입력하세요.' 
		: null;
	
	useEffect(() => {
		if (onValidationChange) {
			onValidationChange(canCompress, handleCompress);
		}
	}, [canCompress, quality, method, outputFormat, targetSizeMode, targetSizeValue, optimize, stripMetadata, progressive, smoothingFactor]);
	
	return (
		<div className="column">
			{/* 1단계: 출력 포맷 선택 */}
			<div className="field">
				<label>출력 포맷 (필수)</label>
				<select value={outputFormat} onChange={e => setOutputFormat(e.target.value as OutputFormat | '')}>
					<option value="">원본 유지</option>
					<option value="JPEG">JPEG</option>
					<option value="PNG" disabled style={{ color: '#999' }}>PNG (비활성화 - 압축 미지원)</option>
					<option value="WEBP">WebP</option>
					<option value="GIF">GIF</option>
				</select>
			</div>
			
			{/* 2단계: 포맷별 압축 알고리즘 */}
			{outputFormat && (
				<div className="field">
					<label>압축 알고리즘</label>
					<select value={method} onChange={e => setMethod(e.target.value as CompressionMethod)}>
						{availableMethods.map(m => (
							<option key={m} value={m}>{COMPRESSION_METHOD_LABELS[m]}</option>
						))}
					</select>
				</div>
			)}
			
			{/* 3단계: 공통 옵션 */}
			{outputFormat && (
				<>
					<div className="field">
						<label>기본 품질 (1-100)</label>
						<input
							type="number"
							min={1}
							max={100}
							value={quality}
							onChange={e => setQuality(Number(e.target.value))}
						/>
					</div>
					
					<div className="field">
						<label>목표 크기 (선택)</label>
						<div className="field-row">
							<select value={targetSizeMode} onChange={e => setTargetSizeMode(e.target.value as 'none' | 'kb' | 'mb' | 'percent')}>
								<option value="none">지정하지 않음</option>
								<option value="kb">KB</option>
								<option value="mb">MB</option>
								<option value="percent">% (원본 대비)</option>
							</select>
							{targetSizeMode !== 'none' && (
								<input
									type="number"
									min={1}
									max={targetSizeMode === 'percent' ? 100 : undefined}
									value={targetSizeValue}
									onChange={e => setTargetSizeValue(e.target.value ? Number(e.target.value) : '')}
									placeholder={targetSizeMode === 'percent' ? '50' : '100'}
								/>
							)}
						</div>
						{targetSizeMode === 'percent' && originalInfo && (
							<small>원본: {formatFileSize(originalInfo.fileSizeBytes)}</small>
						)}
					</div>
				</>
			)}
			
			{/* 4단계: 포맷별 고급 옵션 */}
			{isJPEG && (
				<>
					<h4 style={{ marginTop: '20px', marginBottom: '10px' }}>JPEG 옵션</h4>
					
					<div className="field">
						<label>
							<input
								type="checkbox"
								checked={progressive}
								onChange={e => setProgressive(e.target.checked)}
							/>
							Progressive JPEG
						</label>
					</div>
					
					<div className="field">
						<label>Smoothing Factor (0-100)</label>
						<input
							type="number"
							min={0}
							max={100}
							value={smoothingFactor}
							onChange={e => setSmoothingFactor(Number(e.target.value))}
						/>
						<small>노이즈 감소 (Gaussian Blur)</small>
					</div>
				</>
			)}
			

			

			
			{/* 공통 옵션 */}
			{outputFormat && (
				<>
					<h4 style={{ marginTop: '20px', marginBottom: '10px' }}>공통 옵션</h4>
					
					<div className="field">
						<label>
							<input
								type="checkbox"
								checked={optimize}
								onChange={e => setOptimize(e.target.checked)}
							/>
							최적화 활성화
						</label>
					</div>
					
					<div className="field">
						<label>
							<input
								type="checkbox"
								checked={stripMetadata}
								onChange={e => setStripMetadata(e.target.checked)}
							/>
							메타데이터 제거
						</label>
					</div>
				</>
			)}
			
			{validationError && <p style={{ color: 'orange' }}>{validationError}</p>}
		</div>
	);
}

// 메인 Editor 컴포넌트
export default function Editor() {
	const { fileName, id } = useParams<{ fileName?: string; id?: string }>();
	const navigate = useNavigate();
	
	const [activeTab, setActiveTab] = useState<'resize' | 'compress'>('resize');
	const [originalFile, setOriginalFile] = useState(fileName);
	const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null);
	const [result, setResult] = useState<Result | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [projectName, setProjectName] = useState('');
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [isProjectMode, setIsProjectMode] = useState(false);
	const [canExecute, setCanExecute] = useState(false);
	const [executeAction, setExecuteAction] = useState<(() => void) | null>(null);
	
	// 프로젝트 모드 초기화
	useEffect(() => {
		if (id) {
			const project = projectStorage.getById(id);
			if (project) {
				setIsProjectMode(true);
				setProjectName(project.name);
				setOriginalFile(project.originalFileName);
				
				// 설정값 복원
				if (project.settings) {
					if (project.settings.width || project.settings.height) {
						setActiveTab('resize');
					}
					if (project.settings.format || project.settings.quality) {
						setActiveTab('compress');
					}
				}
			}
		}
	}, [id]);
	
	useEffect(() => {
		if (!originalFile) return;
		
		fetchImageInfo(originalFile)
			.then(setOriginalInfo)
			.catch(() => setError('이미지 정보를 불러올 수 없습니다.'));
	}, [originalFile]);
	
	const handleResize = async (body: Record<string, unknown>) => {
		if (!originalFile) return;
		
		// 기존 결과 초기화 (캐싱 방지)
		setResult(null);
		setLoading(true);
		setError(null);
		
		try {
			const data = await executeResize(originalFile, body);
			setResult(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};
	
	const handleCompress = async (body: Record<string, unknown>) => {
		if (!originalFile) return;
		setLoading(true);
		setError(null);
		
		try {
			const data = await executeCompress(originalFile, body);
			setResult(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const handleSaveProject = () => {
		if (!originalFile) return;

		const name = projectName.trim() || `프로젝트 ${new Date().toLocaleDateString()}`;
		
		try {
			// 설정값만 저장
			const settings: any = {};
			if (result) {
				if (activeTab === 'resize') {
					settings.algorithm = 'LANCZOS';
				} else if (activeTab === 'compress') {
					settings.format = result.mimeType?.split('/')[1] || 'unknown';
					if ('method' in result) {
						settings.method = (result as Types.CompressResult).method;
					}
				}
			}
			
			projectStorage.save({
				name,
				originalFileName: originalFile,
				settings,
			});

			setShowSaveDialog(false);
			setProjectName('');
			alert('프로젝트가 저장되었습니다!');
			navigate('/projects');
		} catch (error) {
			console.error('프로젝트 저장 오류:', error);
			alert('프로젝트 저장 중 오류가 발생했습니다.');
		}
	};
	
	return (
		<div className="container">
			<Navbar />
			
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
				<h1 style={{ margin: 0 }}>이미지 편집기</h1>
				
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					<button
						onClick={() => executeAction?.()}
						disabled={loading || !canExecute || !originalFile}
						style={{
							padding: '8px 16px',
							backgroundColor: canExecute && !loading ? '#007bff' : '#ccc',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: canExecute && !loading ? 'pointer' : 'not-allowed',
							fontSize: '14px',
							fontWeight: '500'
						}}
					>
						{loading ? '⏳ 처리 중...' : activeTab === 'resize' ? '🔄 리사이즈' : '🗜️ 압축'}
					</button>
					
					{showSaveDialog ? (
						<div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
							<input
								type="text"
								placeholder="프로젝트 이름"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								style={{
									padding: '7px 10px',
									border: '2px solid #28a745',
									borderRadius: '4px',
									width: '160px',
									fontSize: '14px'
								}}
							/>
							<button
								onClick={handleSaveProject}
								style={{
									padding: '8px 14px',
									backgroundColor: '#28a745',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500'
								}}
							>
								✓
							</button>
							<button
								onClick={() => setShowSaveDialog(false)}
								style={{
									padding: '8px 14px',
									backgroundColor: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '14px'
								}}
							>
								✕
							</button>
						</div>
					) : (
						<button
							onClick={() => setShowSaveDialog(true)}
							disabled={!result}
							style={{
								padding: '8px 16px',
								backgroundColor: result ? '#28a745' : '#ccc',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: result ? 'pointer' : 'not-allowed',
								fontSize: '14px',
								fontWeight: '500'
							}}
						>
							📁 프로젝트 저장
						</button>
					)}
				</div>
			</div>
			
			{loading && (
				<div style={{
					width: '100%',
					height: '4px',
					backgroundColor: '#e0e0e0',
					borderRadius: '2px',
					overflow: 'hidden',
					marginBottom: '20px'
				}}>
					<div style={{
						width: '50%',
						height: '100%',
						backgroundColor: '#007bff',
						animation: 'loading 1.5s ease-in-out infinite',
					}}></div>
				</div>
			)}
			
			{error && (
				<div style={{
					padding: '12px 20px',
					backgroundColor: '#fee',
					color: '#c33',
					borderRadius: '6px',
					marginBottom: '20px',
					border: '1px solid #fcc'
				}}>
					⚠️ {error}
				</div>
			)}
			
		<div className="row">
			{originalInfo && (
				<ImagePanel
					title="원본"
					imageSrc={`/api/image/${originalFile}`}
					info={originalInfo}
				/>
			)}
			
			{result && (
				<ImagePanel
					title="결과"
					imageSrc={`data:${result.mimeType};base64,${result.base64}`}
					result={result}
				/>
			)}
		</div>
		
		<div className="tabs">
				<button
					className={`tab ${activeTab === 'resize' ? 'active' : ''}`}
					onClick={() => setActiveTab('resize')}
				>
					리사이즈
				</button>
				<button
					className={`tab ${activeTab === 'compress' ? 'active' : ''}`}
					onClick={() => setActiveTab('compress')}
				>
					압축
				</button>
			</div>
			
			{activeTab === 'resize' ? (
				<ResizeTab
					originalFile={originalFile!}
					originalInfo={originalInfo}
					onExecute={handleResize}
					loading={loading}
					error={error}
					onValidationChange={(valid, execute) => {
						setCanExecute(valid);
						setExecuteAction(() => execute);
					}}
				/>
			) : (
				<CompressTab
					originalFile={originalFile!}
					originalInfo={originalInfo}
					onExecute={handleCompress}
					loading={loading}
					error={error}
					onValidationChange={(valid, execute) => {
						setCanExecute(valid);
						setExecuteAction(() => execute);
					}}
				/>
			)}
		</div>
	);
}