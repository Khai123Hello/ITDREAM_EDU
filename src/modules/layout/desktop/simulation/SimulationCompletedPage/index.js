import React, { useEffect, useState } from 'react';
import apiConfig from '@constants/apiConfig';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { sendRequest } from '@services/api';
import { Spin } from 'antd';

import './SimulationCompletedPage.scss';

/* ─────────────────────────── Confetti Effect ─────────────────────────── */

function ConfettiEffect() {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const colors = [
            '#f44336',
            '#e91e63',
            '#9c27b0',
            '#673ab7',
            '#3f51b5',
            '#2196f3',
            '#03a9f4',
            '#00bcd4',
            '#009688',
            '#4caf50',
            '#8bc34a',
            '#cddc39',
            '#ffeb3b',
            '#ffc107',
            '#ff9800',
            '#ff5722',
        ];
        const pieces = [];

        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                r: Math.random() * 6 + 4,
                d: Math.random() * height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0,
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            pieces.forEach((p, idx) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

                if (p.y > height) {
                    pieces[idx] = {
                        x: Math.random() * width,
                        y: -20,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt,
                        tiltAngleIncremental: p.tiltAngleIncremental,
                        tiltAngle: p.tiltAngle,
                    };
                }

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

function SimulationCompletedPage({
    loading = false,
    isGeneratingCert = false,
    simulationDetail = {},
    currentAch = null,
    profile = {},
    onBackToDetail = () => {},
    subtaskFeedbacks = [],
    feedbacksLoading = false,
}) {
    // Parse the PDF certificate URL
    const filePath = currentAch?.filePath;
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const parseFilePath = (path) => {
        if (!path) return null;
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
        }
        const parts = cleanPath.split('/').filter(Boolean);
        if (parts.length >= 3) {
            return {
                folder: parts[parts.length - 3],
                subFolder: parts[parts.length - 2],
                fileName: parts[parts.length - 1],
            };
        }
        return null;
    };

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        if (filePath) {
            const pathParams = parseFilePath(filePath);
            if (pathParams) {
                setIsPreviewLoading(true);
                sendRequest(apiConfig.file.preview, { pathParams })
                    .then((res) => {
                        if (isMounted && res.data) {
                            const blob = new Blob([res.data], { type: 'application/pdf' });
                            objectUrl = URL.createObjectURL(blob);
                            setPreviewBlobUrl(objectUrl);
                        }
                    })
                    .catch(() => {
                        // ignore error
                    })
                    .finally(() => {
                        if (isMounted) {
                            setIsPreviewLoading(false);
                        }
                    });
            }
        } else {
            setPreviewBlobUrl(null);
        }

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [filePath]);

    const handleDownload = async () => {
        if (!filePath) return;
        const pathParams = parseFilePath(filePath);
        if (!pathParams) return;

        setIsDownloading(true);
        try {
            const res = await sendRequest(apiConfig.file.download, { pathParams });
            if (res.data) {
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = pathParams.fileName || 'certificate.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(objectUrl);
            }
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading || isGeneratingCert) {
        return (
            <>
                <AppHeader />
                <div className="tfo-completion-loading">
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#475569', fontWeight: 500 }}>
                        {isGeneratingCert ? 'Đang khởi tạo chứng chỉ PDF...' : 'Đang tải kết quả bài mô phỏng...'}
                    </p>
                </div>
            </>
        );
    }

    const studentName = profile?.fullName || profile?.account?.fullName || 'Học viên';
    const pageTitle = simulationDetail?.title || 'Bài mô phỏng';

    return (
        <>
            <AppHeader />
            <ConfettiEffect />
            <div className="tfo-completion-page">
                <div className="tfo-completion-container">
                    <div className="tfo-completion-header">
                        <div className="tfo-trophy-badge">🏆</div>
                        <h1 className="tfo-completion-title">Hoàn Thành Bài Mô Phỏng!</h1>
                        <p className="tfo-completion-subtitle">
                            Chúc mừng bạn đã hoàn thành xuất sắc tất cả các nhiệm vụ thực tế của dự án. Dưới đây là
                            chứng chỉ chứng nhận thành tích học tập của bạn.
                        </p>
                    </div>

                    {/* Display actual certificate PDF if ready, otherwise fallback to mockup */}
                    {filePath ? (
                        previewBlobUrl ? (
                            <div className="tfo-cert-iframe-container">
                                <iframe
                                    src={`${previewBlobUrl}#toolbar=0&navpanes=0&view=Fit`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none' }}
                                    title="Chứng chỉ hoàn thành"
                                />
                            </div>
                        ) : (
                            <div
                                className="tfo-cert-loading-container"
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
                            >
                                <Spin size="large" tip="Đang tải chứng chỉ..." />
                            </div>
                        )
                    ) : (
                        <div className="tfo-cert-preview-card">
                            <div className="tfo-cert-inner-border">
                                <div className="tfo-cert-header">
                                    <div className="tfo-cert-logo">ITDREAM EDU</div>
                                    <h2 className="tfo-cert-main-title">CHỨNG NHẬN HOÀN THÀNH</h2>
                                    <div className="tfo-cert-award-to">Chứng nhận học viên</div>
                                </div>
                                <div className="tfo-cert-recipient">{studentName}</div>
                                <div className="tfo-cert-body">
                                    Đã hoàn thành xuất sắc bài thực hành mô phỏng công việc thực tế:
                                    <div className="tfo-cert-sim-title">“{pageTitle}”</div>
                                </div>
                                <div className="tfo-cert-footer">
                                    <div className="tfo-cert-seal">
                                        <div className="tfo-seal-circle">
                                            <span>OFFICIAL</span>
                                            <span>SEAL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="tfo-completion-actions">
                        {filePath ? (
                            <button
                                className="tfo-completion-btn tfo-completion-btn-primary"
                                onClick={handleDownload}
                                disabled={isDownloading || isPreviewLoading}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ marginRight: 8 }}
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {isDownloading ? 'Đang tải...' : 'Tải'}
                            </button>
                        ) : (
                            <button
                                className="tfo-completion-btn tfo-completion-btn-secondary"
                                disabled
                                title="Chứng chỉ đang được xử lý hoặc không có sẵn"
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ marginRight: 8 }}
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Tải (Chưa sẵn sàng)
                            </button>
                        )}
                        <button className="tfo-completion-btn tfo-completion-btn-success" onClick={onBackToDetail}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: 8 }}
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Trở về Chi tiết Bài Mô phỏng
                        </button>
                    </div>

                    {/* Educator reviews section */}
                    <div className="tfo-feedback-section">
                        <div className="tfo-feedback-header">
                            <span className="tfo-feedback-header-icon">💬</span>
                            <h2 className="tfo-feedback-header-title">Nhận xét từ Giảng viên</h2>
                        </div>
                        {feedbacksLoading ? (
                            <div className="tfo-feedback-loading">
                                <Spin size="small" />
                                <span style={{ marginLeft: 8, color: '#64748b', fontSize: '14px' }}>
                                    Đang tải nhận xét...
                                </span>
                            </div>
                        ) : subtaskFeedbacks.length === 0 ? (
                            <div className="tfo-feedback-empty">
                                Chưa có nhận xét nào từ giảng viên cho bài làm của bạn.
                            </div>
                        ) : (
                            <div className="tfo-feedback-list">
                                {subtaskFeedbacks.map((item, idx) => (
                                    <div key={item.subtask?.id || idx} className="tfo-feedback-card">
                                        <div className="tfo-feedback-subtask-title">
                                            Nhiệm vụ: {item.subtask?.title || item.subtask?.name || 'Bài học'}
                                        </div>
                                        <div className="tfo-feedback-comments">
                                            {item.reviews.map((review) => (
                                                <div key={review.id} className="tfo-feedback-comment-item">
                                                    <div className="tfo-feedback-comment-header">
                                                        <span className="tfo-feedback-educator-badge">
                                                            Giảng viên nhận xét
                                                        </span>
                                                    </div>
                                                    <div className="tfo-feedback-comment-content">{review.content}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SimulationCompletedPage;
