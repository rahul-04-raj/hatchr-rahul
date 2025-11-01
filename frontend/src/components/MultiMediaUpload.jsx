import React, { useState, useRef } from 'react';

export default function MultiMediaUpload({ onFilesSelect, maxFiles = 10 }) {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (files.length + selectedFiles.length > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);

        // Create previews
        const newPreviews = [...previews];
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push({
                    url: reader.result,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    file: file
                });
                setPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });

        if (onFilesSelect) {
            onFilesSelect(newFiles);
        }
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);

        if (onFilesSelect) {
            onFilesSelect(newFiles);
        }
    };

    const moveFile = (fromIndex, toIndex) => {
        const newFiles = [...files];
        const newPreviews = [...previews];

        const [movedFile] = newFiles.splice(fromIndex, 1);
        const [movedPreview] = newPreviews.splice(fromIndex, 1);

        newFiles.splice(toIndex, 0, movedFile);
        newPreviews.splice(toIndex, 0, movedPreview);

        setFiles(newFiles);
        setPreviews(newPreviews);

        if (onFilesSelect) {
            onFilesSelect(newFiles);
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input Button */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length >= maxFiles}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Media ({files.length}/{maxFiles})
                </button>
                <span className="text-sm text-gray-500">
                    Images and videos supported (max {maxFiles})
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Previews Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                        >
                            {/* Preview */}
                            {preview.type === 'video' ? (
                                <video
                                    src={preview.url}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={preview.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Media Type Badge */}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                {preview.type === 'video' ? 'Video' : 'Image'}
                            </div>

                            {/* Order Badge */}
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                            </div>

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2">
                                {/* Move Left */}
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => moveFile(index, index - 1)}
                                        className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 hover:bg-gray-200 transition-all"
                                        title="Move left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* Remove */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all"
                                    title="Remove"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Move Right */}
                                {index < previews.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => moveFile(index, index + 1)}
                                        className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 hover:bg-gray-200 transition-all"
                                        title="Move right"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}