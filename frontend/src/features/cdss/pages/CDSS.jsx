import React, { useState } from 'react';
import styles from './CDSS.module.css';

export default function CDSS() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [resultVisible, setResultVisible] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [confidence, setConfidence] = useState(0);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setResultVisible(false); // Reset result on new upload
                setResultImage(null); // Clear previous result image
                setConfidence(0);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setAnalyzing(true);

        try {
            // Create FormData to send file
            const formData = new FormData();
            // We need to convert the dataURL to a Blob/File object
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            formData.append('image', blob, 'xray.png');

            const apiResponse = await fetch('http://localhost:8000/api/cdss/predict/', {
                method: 'POST',
                body: formData,
            });

            const data = await apiResponse.json();

            if (data.success && data.image) {
                // The backend returns a simulated overlay or processed image
                // For now, we will use the returned image as the result overlay
                setResultImage(data.image);
                setConfidence(data.confidence);
                setResultVisible(true);
            } else {
                alert('Analysis failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Error connecting to server. Please ensure backend is running.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>AI Dental Segmentation</h1>
                <p className={styles.subtitle}>
                    Advanced Clinical Decision Support System for automated teeth segmentation and analysis.
                </p>
            </header>

            <main className={styles.content}>
                {/* Upload Section */}
                <div className={styles.uploadSection} onClick={() => document.getElementById('fileUpload').click()}>
                    <input
                        type="file"
                        id="fileUpload"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={handleFileChange}
                    />
                    <svg className={styles.uploadIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className={styles.uploadText}>
                        {selectedImage ? "Change X-Ray Image" : "Upload X-Ray Image"}
                    </div>
                    <p className={styles.uploadSubtext}>Drag & drop or click to browse</p>
                </div>

                {/* Selected Image Preview (Before Analysis) */}
                {selectedImage && !resultVisible && (
                    <div className={styles.imageCard} style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Original X-Ray</span>
                            <span className={styles.cardBadge}>Ready for Analysis</span>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src={selectedImage} alt="Original" className={styles.previewImage} />
                        </div>
                    </div>
                )}

                {/* Analyze Button */}
                {selectedImage && !resultVisible && (
                    <button
                        className={styles.analyzeBtn}
                        onClick={handleAnalyze}
                        disabled={analyzing}
                    >
                        {analyzing ? 'Processing...' : 'Analyze Segmentation'}
                    </button>
                )}

                {/* Results Section */}
                {resultVisible && (
                    <div className={styles.resultSection}>
                        <div className={styles.imageCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>Original Scan</span>
                                <span className={styles.cardBadge}>Input</span>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src={selectedImage} alt="Original" className={styles.previewImage} />
                            </div>
                        </div>

                        <div className={styles.imageCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>AI Segmentation</span>
                                <span className={styles.cardBadge} style={{ background: '#dcfce7', color: '#166534' }}>
                                    {(confidence * 100).toFixed(1)}% Confidence
                                </span>
                            </div>
                            <div className={styles.imageContainer}>
                                {/* Display actual result from backend */}
                                <img
                                    src={resultImage || selectedImage}
                                    alt="Segmented Mask"
                                    className={styles.previewImage}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
