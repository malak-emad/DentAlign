import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DicomViewer.module.css';

const DicomViewport = ({ studyId, plane, label, globalTools }) => {
    const [imageData, setImageData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlice, setCurrentSlice] = useState(0);
    const [totalSlices, setTotalSlices] = useState(0);
    const [sliceCache, setSliceCache] = useState({});

    // Viewport-specific transformation state (syncs with global tools but can be independent)
    const [viewportTransform, setViewportTransform] = useState({
        x: 0,
        y: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    });

    const viewportRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Trigger fetch when dependencies change (Slice, Window, Level, Filter)
    useEffect(() => {
        if (studyId) {
            // Debounce the fetch to prevent UI freezing during slider drag
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

            debounceTimerRef.current = setTimeout(() => {
                fetchSlice(studyId, currentSlice, plane);
            }, 100);
        }
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [studyId, plane, currentSlice, globalTools.windowLevel, globalTools.windowWidth, globalTools.filterType]);

    const fetchSlice = async (id, sliceIndex, viewPlane) => {
        // Cache key must include rendering parameters now
        const cacheKey = `${id}-${viewPlane}-${sliceIndex}-${globalTools.filterType}-${globalTools.windowLevel}-${globalTools.windowWidth}`;

        if (sliceCache[cacheKey]) {
            setImageData(sliceCache[cacheKey]);
            // sliceIndex is managed by parent/state, just ensure image matches
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/imaging/process/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Token ${token}` }),
                },
                body: JSON.stringify({
                    file_id: id,
                    filter_type: globalTools.filterType,
                    slice_index: sliceIndex,
                    plane: viewPlane,
                    window_center: globalTools.windowLevel,
                    window_width: globalTools.windowWidth
                }),
            });

            if (!response.ok) throw new Error('Failed to load image');

            const data = await response.json();
            if (data.success && data.image) {
                setImageData(data.image);
                setSliceCache(prev => ({
                    ...prev,
                    [cacheKey]: data.image
                }));
                if (data.total_slices !== undefined) setTotalSlices(data.total_slices);
                // Only update current slice if we didn't request a specific one (initial load)
                if (sliceIndex === null && data.current_slice !== undefined) {
                    setCurrentSlice(data.current_slice);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSliceChange = (e) => {
        const newSlice = parseInt(e.target.value, 10);
        setCurrentSlice(newSlice);
        // useEffect will trigger fetch
    };

    // Pan Handlers
    const onMouseDown = (e) => {
        setViewportTransform(prev => ({
            ...prev,
            isDragging: true,
            startX: e.clientX - prev.x,
            startY: e.clientY - prev.y
        }));
    };

    const onMouseMove = useCallback((e) => {
        if (!viewportTransform.isDragging) return;
        setViewportTransform(prev => ({
            ...prev,
            x: e.clientX - prev.startX,
            y: e.clientY - prev.startY
        }));
    }, [viewportTransform.isDragging]);

    const onMouseUp = () => {
        setViewportTransform(prev => ({ ...prev, isDragging: false }));
    };

    useEffect(() => {
        if (viewportTransform.isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [viewportTransform.isDragging, onMouseMove]);

    if (!studyId) {
        return (
            <div className={styles.viewportPlaceholder}>
                <p>No Study Selected</p>
                <p className={styles.subtext}>{label} View</p>
            </div>
        );
    }

    const imageStyle = {
        transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${globalTools.zoom}) rotate(${globalTools.rotation}deg)`,
        // CSS filters removed as we do backend processing
        maxWidth: 'none',
        maxHeight: 'none',
        objectFit: 'contain',
        cursor: viewportTransform.isDragging ? 'grabbing' : 'grab',
        transition: viewportTransform.isDragging ? 'none' : 'transform 0.1s ease-out'
    };

    return (
        <div className={styles.viewportItem} style={{ flex: 1, margin: '5px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div style={{ padding: '5px', backgroundColor: '#1f2937', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {label}
            </div>
            <div
                ref={viewportRef}
                onMouseDown={onMouseDown}
                style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', overflow: 'hidden' }}
            >
                {isLoading && <div style={{ position: 'absolute', top: '5px', right: '5px', color: 'white', zIndex: 10 }}>Processing...</div>}
                {imageData ? (
                    <img
                        src={imageData}
                        alt={`${label} Scan`}
                        style={imageStyle}
                        draggable="false"
                    />
                ) : (
                    !isLoading && <div style={{ color: '#666' }}>No Image</div>
                )}
            </div>
            {totalSlices > 1 && (
                <div style={{ padding: '8px', backgroundColor: '#1f2937' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.75rem', marginBottom: '2px' }}>
                        <span>Slice: {currentSlice + 1} / {totalSlices}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={totalSlices - 1}
                        value={currentSlice}
                        onChange={handleSliceChange}
                        className={styles.sliceRange}
                    />
                </div>
            )}
        </div>
    );
};

import VolumeViewer3D from '../components/VolumeViewer3D';

export default function DicomViewer() {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(null);

    // Global Tool State
    const [tools, setTools] = useState({
        zoom: 1,
        rotation: 0,
        windowLevel: 40, // Default Soft Tissue
        windowWidth: 400,
        filterType: 'original' // original, sharpen, smooth, noise_reduction
    });

    const handleToolChange = (tool, value) => {
        setTools(prev => ({ ...prev, [tool]: value }));
    };

    const resetTools = () => {
        setTools({
            zoom: 1,
            rotation: 0,
            windowLevel: 40,
            windowWidth: 400,
            filterType: 'original'
        });
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/imaging/upload/', {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Token ${token}` }),
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.detail || JSON.stringify(errorData) || 'Upload failed';
                throw new Error(errorMsg);
            }

            const data = await response.json();
            setStudies(prev => [{
                id: data.id,
                name: file.name,
                date: new Date().toLocaleDateString(),
                path: data.file
            }, ...prev]);

        } catch (err) {
            console.error(err);
            setUploadError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Dicom Viewer</h1>
                <div className={styles.toolbar}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".dcm,.nrrd"
                        style={{ display: 'none' }}
                    />
                    <button
                        className={`${styles.toolBtn} ${styles.uploadBtn}`}
                        onClick={handleUploadClick}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload DICOM'}
                    </button>

                    <div className={styles.toolGroup}>
                        <label>Zoom</label>
                        <input
                            type="range" min="0.1" max="5" step="0.1"
                            value={tools.zoom}
                            onChange={(e) => handleToolChange('zoom', parseFloat(e.target.value))}
                        />
                        <span>{Math.round(tools.zoom * 100)}%</span>
                    </div>

                    <div className={styles.toolGroup}>
                        <label title="Window Level (Brightness)">Win Level</label>
                        <input
                            type="range" min="-1000" max="2000" step="10"
                            value={tools.windowLevel}
                            onChange={(e) => handleToolChange('windowLevel', parseInt(e.target.value))}
                        />
                        <span style={{ width: '30px', fontSize: '0.7em' }}>{tools.windowLevel}</span>
                    </div>

                    <div className={styles.toolGroup}>
                        <label title="Window Width (Contrast)">Win Width</label>
                        <input
                            type="range" min="1" max="4000" step="10"
                            value={tools.windowWidth}
                            onChange={(e) => handleToolChange('windowWidth', parseInt(e.target.value))}
                        />
                        <span style={{ width: '30px', fontSize: '0.7em' }}>{tools.windowWidth}</span>
                    </div>

                    <div className={styles.toolGroup}>
                        <label>Filter</label>
                        <select
                            value={tools.filterType}
                            onChange={(e) => handleToolChange('filterType', e.target.value)}
                            style={{ backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '4px' }}
                        >
                            <option value="original">Original</option>
                            <option value="sharpen">Sharpen</option>
                            <option value="smooth">Smooth</option>
                            <option value="noise_reduction">Reduce Noise</option>
                        </select>
                    </div>

                    <button className={styles.toolBtn} onClick={() => handleToolChange('rotation', (tools.rotation + 90) % 360)}>
                        Rotate 90°
                    </button>

                    <button className={styles.toolBtn} onClick={resetTools}>Reset</button>
                </div>
            </header>
            <div className={styles.mainArea}>
                <aside className={styles.sidebar}>
                    <h3>Studies</h3>
                    <div className={styles.studyList}>
                        {studies.length === 0 ? (
                            <div className={styles.studyItem}>No studies loaded</div>
                        ) : (
                            studies.map((study) => (
                                <div
                                    key={study.id}
                                    className={`${styles.studyItem} ${selectedStudy?.id === study.id ? styles.activeStudy : ''}`}
                                    onClick={() => setSelectedStudy(study)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div>{study.name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{study.date}</div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
                <div className={styles.viewportContainer}>
                    {uploadError && <div className={styles.errorMessage}>Error: {uploadError}</div>}
                    <div className={styles.viewportGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px', padding: '10px', height: '100%', width: '100%' }}>
                        <DicomViewport studyId={selectedStudy?.id} plane="axial" label="Axial" globalTools={tools} />
                        <DicomViewport studyId={selectedStudy?.id} plane="coronal" label="Coronal" globalTools={tools} />
                        <DicomViewport studyId={selectedStudy?.id} plane="sagittal" label="Sagittal" globalTools={tools} />
                        <div className={styles.viewportItem} style={{ border: '1px solid #333', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '5px', backgroundColor: '#1f2937', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                3D Volume Rendering
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <VolumeViewer3D studyId={selectedStudy?.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


