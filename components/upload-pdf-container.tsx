"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { IconFileTypePdf, IconTrash, IconX, IconCircleCheckFilled } from '@tabler/icons-react'

type UploadPdfContainerProps = {
	onFileSelected?: (file: File) => void
}

const UploadPdfContainer: React.FC<UploadPdfContainerProps> = ({ onFileSelected }) => {
	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [status, setStatus] = useState<"idle" | "uploading" | "completed">("idle")
	const [progress, setProgress] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const timerRef = useRef<number | null>(null)

	const validateAndSetFile = useCallback((f: File | undefined) => {
		if (!f) return
		if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
			setError('Only PDF files are supported')
			setFile(null)
			return
		}
		setError(null)
		setFile(f)
		setStatus("uploading")
		setProgress(0)
		onFileSelected?.(f)
	}, [onFileSelected])

	const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const f = e.dataTransfer.files?.[0]
		validateAndSetFile(f)
	}, [validateAndSetFile])

	const onBrowse = useCallback(() => {
		inputRef.current?.click()
	}, [])

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0]
		validateAndSetFile(f)
	}, [validateAndSetFile])

	// Simulate upload progress for UI purposes
	useEffect(() => {
		if (status !== "uploading") return
		if (timerRef.current) window.clearInterval(timerRef.current)
		timerRef.current = window.setInterval(() => {
			setProgress((p) => {
				const next = Math.min(100, p + Math.max(2, Math.round(Math.random() * 10)))
				if (next >= 100) {
					if (timerRef.current) window.clearInterval(timerRef.current)
					setStatus("completed")
				}
				return next
			})
		}, 300)
		return () => {
			if (timerRef.current) window.clearInterval(timerRef.current)
		}
	}, [status])

	const cancelUpload = useCallback(() => {
		if (timerRef.current) window.clearInterval(timerRef.current)
		setStatus("idle")
		setProgress(0)
		setFile(null)
	}, [])

	const removeFile = useCallback(() => {
		setStatus("idle")
		setProgress(0)
		setFile(null)
	}, [])

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	}

	return (
		<>
		{!file && (
			<div
				className={`flex flex-col rounded-lg py-6 px-2 w-full border-2 border-dashed ${
					isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200'
				}`}
				onDragOver={(e) => e.preventDefault()}
				onDragEnter={() => setIsDragging(true)}
				onDragLeave={() => setIsDragging(false)}
				onDrop={onDrop}
			>
				<input
					ref={inputRef}
					type="file"
					accept="application/pdf,.pdf"
					className="hidden"
					onChange={onChange}
				/>
				<div className='flex flex-col gap-3 items-center justify-center'>
					<IconFileTypePdf className='text-gray-300 w-10 h-10'/>
					<div className='flex flex-col items-center justify-center'>
						<h1 className='text-sm text-gray-500'>
							Drag and drop your pdf here
						</h1>
						<p className='text-xs text-gray-400'>
							File Supported: .pdf
						</p>
					</div>
					{error ? (
						<p className='text-xs text-red-500'>{error}</p>
					) : null}
					<div className='mt-3'>
						<Button variant='secondary' onClick={onBrowse}>
							Choose PDF
						</Button>
					</div>
				</div>
			</div>
		)}

		{/* Selected item display (outside dashed box) */}
		{file && (
			<div className="w-full">
				<div className="rounded-lg border overflow-hidden">
					<div className="grid grid-cols-[56px_1fr_40px] items-stretch">
						{/* Icon cell */}
						<div className="flex items-center justify-center pl-1">
							<img src="/PDFIcon_1.svg" alt="PDF" className="h-12 w-12" />
						</div>
						{/* Content cell */}
						<div className="p-3">
							<p className="text-sm font-medium truncate">{file.name}</p>
							<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
								<span>
									{status === 'uploading'
										? `${formatSize(Math.round((progress / 100) * file.size))} of ${formatSize(file.size)}`
										: `${formatSize(file.size)} of ${formatSize(file.size)}`}
								</span>
								<span>•</span>
								{status === 'uploading' ? (
									<span className="animate-pulse">Uploading...</span>
								) : (
									<span className="flex items-center gap-1 text-green-600">
										<IconCircleCheckFilled className="h-3.5 w-3.5" /> Completed
									</span>
								)}
							</div>
							{status === 'uploading' && (
								<div className="mt-2 h-1.5 w-full rounded-full bg-muted">
									<div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
								</div>
							)}
						</div>
						{/* Actions cell */}
						<div className="flex items-start justify-end p-3">
							{status === 'uploading' ? (
								<button onClick={cancelUpload} aria-label="Cancel" className="text-muted-foreground hover:text-foreground">
									<IconX className="h-4 w-4" />
								</button>
							) : (
								<button onClick={removeFile} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
									<IconTrash className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		)}
		</>
	)
}
export default UploadPdfContainer