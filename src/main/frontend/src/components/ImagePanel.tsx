import type { ImageInfo, Result, CompressResult } from '../types';
import { formatFileSize, formatImageDimensions, formatCompressionRatio } from '../utils/format';

interface ImagePanelProps {
	title: string;
	imageSrc: string;
	info?: ImageInfo;
	result?: Result;
}

export default function ImagePanel({ title, imageSrc, info, result }: ImagePanelProps) {
	return (
		<div className="image-panel">
			<h3>{title}</h3>
			<div className="image-container">
				<img src={imageSrc} alt={title} className="image-preview" />
			</div>
			{info && (
				<div className="info">
					<p>{formatImageDimensions(info.width, info.height)}</p>
					<p>{info.format} · {formatFileSize(info.fileSizeBytes)}</p>
				</div>
			)}
			{result && (
				<div className="info">
					<p>{formatImageDimensions(result.width, result.height)}</p>
					{'compressedSizeBytes' in result ? (
						<>
							<p>{result.mimeType.split('/')[1].toUpperCase()} · {formatFileSize(result.compressedSizeBytes)}</p>
							<p>
								압축률: {formatCompressionRatio(result.compressionRatio)} 
								({formatFileSize(result.originalSizeBytes)} → {formatFileSize(result.compressedSizeBytes)})
							</p>
						</>
					) : (
						<p>{result.mimeType.split('/')[1].toUpperCase()} · {formatFileSize(result.base64.length * 0.75)}</p>
					)}
				</div>
			)}
		</div>
	);
}
