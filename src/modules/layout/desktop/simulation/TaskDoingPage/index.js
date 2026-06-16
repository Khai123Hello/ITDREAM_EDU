import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppConstants } from '@constants';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Spin } from 'antd';

import CommentPanel from '../components/CommentPanel';
import TaskDoingSidebar from '../components/TaskDoingSidebar';

import './TaskDoingPage.scss';

/* ─────────────────────────── helpers ─────────────────────────── */

function detectContentType(content) {
    if (!content || typeof content !== 'string') return 'empty';
    const trimmed = content.trim();
    if (trimmed.startsWith('[')) {
        try {
            const p = JSON.parse(trimmed);
            if (Array.isArray(p)) return 'blocks';
        } catch {
            // ignore
        }
    }
    if (/^#{1,3}\s|\*\s|\*\*/m.test(trimmed)) return 'markdown';
    return 'text';
}

function parseInline(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

/* ─────────────────────── plain / markdown renderers ─────────────────── */

function PlainTextContent({ text }) {
    return (
        <div className="tfo-plain-text">
            {text.split('\n\n').map((para, i) => (
                <p key={i}>{para.trim()}</p>
            ))}
        </div>
    );
}

function MarkdownContent({ text }) {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let key = 0;

    const flushList = () => {
        if (listItems.length) {
            elements.push(
                <ul key={key++} className="tfo-md-list">
                    {listItems.map((li, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(li) }} />
                    ))}
                </ul>,
            );
            listItems = [];
        }
    };

    lines.forEach((line) => {
        const h3 = line.match(/^###\s+(.+)/);
        const h2 = line.match(/^##\s+(.+)/);
        const h1 = line.match(/^#\s+(.+)/);
        const li = line.match(/^\*\s+(.+)/);
        const blank = line.trim() === '';

        if (h1) {
            flushList();
            elements.push(
                <h2 key={key++} className="tfo-block-h1">
                    {h1[1]}
                </h2>,
            );
            return;
        }
        if (h2) {
            flushList();
            elements.push(
                <h2 key={key++} className="tfo-block-h2">
                    {h2[1]}
                </h2>,
            );
            return;
        }
        if (h3) {
            flushList();
            elements.push(
                <h3 key={key++} className="tfo-block-h3">
                    {h3[1]}
                </h3>,
            );
            return;
        }
        if (li) {
            listItems.push(li[1]);
            return;
        }
        if (blank) {
            flushList();
            return;
        }
        flushList();
        elements.push(
            <p key={key++} className="tfo-block-text" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />,
        );
    });
    flushList();
    return <div className="tfo-markdown-content">{elements}</div>;
}

/* ─────────────────────────── Quiz Block (interactive) ─────────────────── */

function QuizBlock({
    block,
    submittedAnswer = null,
    questionId = null,
    onQuizAnswerSubmit = () => {},
    hasCompleted = false,
}) {
    const [ selected, setSelected ] = useState(null);
    const [ submitted, setSubmitted ] = useState(false);
    const [ isRetrying, setIsRetrying ] = useState(false);

    const correct = (block.options || []).findIndex((o) => o.answer === true);
    const savedAnswer = submittedAnswer?.answer;
    const savedOptionIndex = (block.options || []).findIndex(
        (o) => o.option === savedAnswer || o.value === savedAnswer,
    );

    useEffect(() => {
        setIsRetrying(false);
        setSelected(null);
        setSubmitted(false);
    }, [ questionId, savedAnswer ]);

    const effectiveSelected = savedAnswer && !isRetrying ? savedOptionIndex : selected;
    const effectiveSubmitted = Boolean(savedAnswer) && !isRetrying ? true : submitted;
    const isCorrect = effectiveSubmitted && effectiveSelected === correct;

    const handleSubmit = () => {
        if (selected === null) return;
        setSubmitted(true);
        const selectedOption = (block.options || [])[selected];
        onQuizAnswerSubmit({
            taskQuestionId: questionId,
            answer: selectedOption?.option || selectedOption?.value || '',
            isCorrect: selected === correct,
        });
    };

    const handleReset = () => {
        setSelected(null);
        setSubmitted(false);
        setIsRetrying(true);
    };

    return (
        <div className={`tfo-block-quiz${effectiveSubmitted ? (isCorrect ? ' quiz-correct' : ' quiz-wrong') : ''}`}>
            {/* Question */}
            <div className="tfo-block-quiz-question">
                <span className="tfo-block-quiz-icon">❓</span>
                <span className="tfo-block-quiz-text">{block.question}</span>
            </div>

            {/* Options */}
            <div className="tfo-block-quiz-options">
                {(block.options || []).map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    let cls = 'tfo-quiz-option';
                    if (effectiveSelected === oi) cls += ' selected';
                    if (effectiveSubmitted && oi === correct) cls += ' answer-correct';
                    if (effectiveSubmitted && effectiveSelected === oi && oi !== correct) cls += ' answer-wrong';

                    return (
                        <button
                            key={oi}
                            className={cls}
                            disabled={effectiveSubmitted || hasCompleted}
                            onClick={() => !(effectiveSubmitted || hasCompleted) && setSelected(oi)}
                        >
                            <span className="tfo-quiz-option-letter">{letter}.</span>
                            <span className="tfo-quiz-option-text">{opt.option}</span>
                            {effectiveSubmitted && oi === correct && (
                                <span className="tfo-quiz-option-badge correct">✓ Đúng</span>
                            )}
                            {effectiveSubmitted && effectiveSelected === oi && oi !== correct && (
                                <span className="tfo-quiz-option-badge wrong">✗ Sai</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="tfo-block-quiz-footer">
                {!effectiveSubmitted ? (
                    <button
                        className="tfo-quiz-submit-btn"
                        disabled={selected === null || hasCompleted}
                        onClick={handleSubmit}
                    >
                        Kiểm tra đáp án
                    </button>
                ) : (
                    <div className="tfo-quiz-result-row">
                        <span className={`tfo-quiz-result-label ${isCorrect ? 'correct' : 'wrong'}`}>
                            {isCorrect ? '🎉 Chính xác!' : '😅 Chưa đúng, hãy thử lại!'}
                        </span>
                        {!isCorrect && (
                            <button className="tfo-quiz-retry-btn" disabled={hasCompleted} onClick={handleReset}>
                                Làm lại
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────── Block Item ─────────────────────────── */

function BlockItem({
    block,
    idx,
    allBlocks,
    quizSubmissionMap = {},
    questionMap = {},
    onQuizAnswerSubmit = () => {},
    hasCompleted = false,
}) {
    switch (block.type) {
                    case 'meta':
                        return (
                            <div className="tfo-block-meta">
                                <span className="tfo-block-meta-val">{block.duration}</span>
                                <span className="tfo-block-meta-dot">·</span>
                                <span className="tfo-block-meta-val">{block.level}</span>
                            </div>
                        );

                    case 'section':
                        return (
                            <div className="tfo-block-section">
                                <div className="tfo-block-section-header">
                                    <span className="tfo-block-section-icon">{block.icon}</span>
                                    <span className="tfo-block-section-title">{block.title}</span>
                                </div>
                                <ul className="tfo-block-section-list">
                                    {(block.bullets || []).filter(Boolean).map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                        );

                    case 'text':
                        return <p className="tfo-block-text">{block.content}</p>;

                    case 'h1':
                        return <h2 className="tfo-block-h1">{block.content}</h2>;

                    case 'h2':
                        return <h3 className="tfo-block-h2">{block.content}</h3>;

                    case 'h3':
                        return <h4 className="tfo-block-h3">{block.content}</h4>;

                    case 'bullet':
                        return (
                            <div className="tfo-block-bullet-wrap">
                                <span className="tfo-block-bullet-dot">•</span>
                                <span className="tfo-block-bullet-text">{block.content}</span>
                            </div>
                        );

                    case 'numbered': {
                        const num = allBlocks.filter((b, i) => b.type === 'numbered' && i <= idx).length;
                        return (
                            <div className="tfo-block-bullet-wrap">
                                <span className="tfo-block-num-label">{num}.</span>
                                <span className="tfo-block-bullet-text">{block.content}</span>
                            </div>
                        );
                    }

                    case 'divider':
                        return <hr className="tfo-block-divider" />;

                    case 'callout':
                        return (
                            <div className="tfo-block-callout">
                                <span className="tfo-block-callout-icon">{block.icon || '💡'}</span>
                                <span className="tfo-block-callout-text">{block.content}</span>
                            </div>
                        );

                    case 'code':
                        return (
                            <div className="tfo-block-code">
                                <pre>{block.content}</pre>
                            </div>
                        );

                    case 'step': {
                        const renderStepBody = (text) => {
                            if (!text) return '';
                            const parts = text.split(/(`[^`]+`)/g);
                            return parts.map((part, pi) => {
                                if (part.startsWith('`') && part.endsWith('`')) {
                                    return <code key={pi}>{part.slice(1, -1)}</code>;
                                }
                                return part;
                            });
                        };
                        return (
                            <div className="tfo-block-step">
                                <span className="tfo-block-step-label">{block.label}:</span>
                                <span className="tfo-block-step-body">{renderStepBody(block.body)}</span>
                            </div>
                        );
                    }

                    case 'quiz': {
                        const questionKey = (block.question || '').trim();
                        const questionId = questionKey ? (questionMap[questionKey] ?? null) : null;
                        return (
                            <QuizBlock
                                block={block}
                                submittedAnswer={questionId ? quizSubmissionMap[questionId] : null}
                                questionId={questionId}
                                onQuizAnswerSubmit={onQuizAnswerSubmit}
                                hasCompleted={hasCompleted}
                            />
                        );
                    }

                    default:
                        return null;
    }
}

/* ─────────────────────────── Blocks content ─────────────────────────── */

function BlocksContent({
    blocksJson,
    quizSubmissionMap = {},
    questionMap = {},
    onQuizAnswerSubmit = () => {},
    hasCompleted = false,
}) {
    const blocks = useMemo(() => {
        try {
            return JSON.parse(blocksJson);
        } catch {
            return [];
        }
    }, [ blocksJson ]);

    return (
        <div className="tfo-blocks-content">
            {blocks.map((block, idx) => (
                <BlockItem
                    key={block.id || idx}
                    block={block}
                    idx={idx}
                    allBlocks={blocks}
                    quizSubmissionMap={quizSubmissionMap}
                    questionMap={questionMap}
                    onQuizAnswerSubmit={onQuizAnswerSubmit}
                    hasCompleted={hasCompleted}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────── Content Router ─────────────────────────── */

function ContentRenderer({
    content,
    quizSubmissionMap = {},
    questionMap = {},
    onQuizAnswerSubmit = () => {},
    hasCompleted = false,
}) {
    const type = useMemo(() => detectContentType(content), [ content ]);
    if (type === 'empty') return <p className="tfo-empty-content">Không có nội dung.</p>;
    if (type === 'blocks') {
        return (
            <BlocksContent
                blocksJson={content}
                quizSubmissionMap={quizSubmissionMap}
                questionMap={questionMap}
                onQuizAnswerSubmit={onQuizAnswerSubmit}
                hasCompleted={hasCompleted}
            />
        );
    }
    if (type === 'markdown') return <MarkdownContent text={content} />;
    return <PlainTextContent text={content} />;
}

/* ─────────────────────────── File Dropzone ─────────────────────────── */

function FileDropzone({ onFileChange = () => {}, previousFile = null, urlBase = '', disabled = false }) {
    const [ dragging, setDragging ] = useState(false);
    const [ file, setFile ] = useState(null);

    useEffect(() => {
        setFile(null);
    }, [ previousFile ]);

    const handleDrop = (e) => {
        e.preventDefault();
        if (disabled) return;
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    const handleChange = (e) => {
        if (disabled) return;
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    const getFileName = (path) => {
        if (!path) return '';
        const parts = path.split('/');
        return decodeURIComponent(parts[parts.length - 1]);
    };

    const displayFileName = file ? file.name : previousFile ? getFileName(previousFile) : '';

    return (
        <div className={`tfo-upload-card${disabled ? ' disabled' : ''}`}>
            <div className="tfo-upload-label">Nộp Bài Làm Của Bạn</div>
            <label
                className={`tfo-dropzone${dragging ? ' dragging' : ''}${disabled ? ' disabled' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                {!disabled && <input type="file" style={{ display: 'none' }} onChange={handleChange} />}
                <svg className="tfo-dropzone-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M8 1v10M4 5l4-4 4 4"
                        stroke="#5f5e5e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"
                        stroke="#5f5e5e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
                {displayFileName ? (
                    <span className="tfo-file-chosen">
                        {previousFile && !file ? (
                            <a
                                href={previousFile.startsWith('http') ? previousFile : `${urlBase}${previousFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="tfo-file-download-link"
                            >
                                {displayFileName} (Tải xuống)
                            </a>
                        ) : (
                            displayFileName
                        )}
                    </span>
                ) : (
                    <>
                        <span className="tfo-dropzone-select">Chọn một tệp</span>
                        <span className="tfo-dropzone-hint">hoặc kéo thả vào đây.</span>
                    </>
                )}
            </label>
        </div>
    );
}

/* ─────────────────────────── Footer Nav ─────────────────────────── */

function FooterNav({
    onBack = () => {},
    onNext = () => {},
    canGoBack = true,
    canGoNext = true,
    isLastSubtask = false,
}) {
    return (
        <footer className="tfo-footer-nav">
            <div className="tfo-footer-inner">
                <div className="tfo-footer-buttons">
                    <button className="tfo-btn-back" onClick={onBack} disabled={!canGoBack}>
                        Quay lại
                    </button>
                    <button className="tfo-btn-next" onClick={onNext} disabled={!canGoNext}>
                        {isLastSubtask ? 'Hoàn thành' : 'Tiếp tục'}
                    </button>
                </div>
            </div>
        </footer>
    );
}

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

/**
 * TaskDoingPage
 * Renders task content using the BlockEditor block format.
 * Supports: text, h1-h3, bullet, numbered, divider, callout, code, meta, section, step, quiz.
 *
 * Không có nút "Bắt đầu" hay "Hoàn thành" riêng biệt.
 * Tiến độ tự động lưu. Nút "Tiếp tục" sẽ kiểm tra điều kiện và gọi complete.
 * Nút "Làm lại" cho phép học viên reset câu trả lời và nộp lại.
 */
export default function TaskDoingPage({
    // Loading/Error
    loading = false,
    error = null,
    onRetry = () => {},

    // Sidebar
    taskNumber = 1,
    taskLabel = 'Nhiệm vụ',
    taskDescription = '',
    companyLogo = null,
    parentTasks = [],
    selectedParentTaskId = null,
    onSelectParentTask = () => {},

    // Subtask navigation
    subtasks = [],
    selectedSubtaskId = null,
    onSelectSubtask = () => {},

    // Content
    pageTitle = 'Nhiệm vụ',
    taskHeading = 'Đang tải...',
    taskBody = '',
    taskDescriptionContent = '',
    mediaPath = null,
    urlBase = '',

    // Progress
    taskStatus = 'not_started', // 'not_started' | 'in_progress' | 'completed'
    hasCompleted = false,
    isLastSubtask = false,

    // Navigation
    canGoBack = false,
    canGoNext = false,
    onBack = () => {},
    onNext = () => {},

    // Submission
    onFileChange = () => {},
    requiresFileUpload = false,
    requiresTextResponse = false,
    previousFile = null,
    previousText = '',
    onTextResponseSubmit = () => {},
    quizSubmissionMap = {},
    questionMap = {},
    onQuizAnswerSubmit = () => {},

    // Certificate and congrats
    isGeneratingCert = false,
    congratsData = { show: false, filePath: '' },
    onCloseCongrats = () => {},
    simulationId = null,

    // Profile details
    profile = {},

    // Comments
    comments = [],
    commentsLoading = false,
    showComments = false,
    setShowComments = () => {},
    onSendComment = () => {},
    onUpdateComment = () => {},
}) {
    const navigate = useNavigate();
    const [ textInput, setTextInput ] = useState('');

    useEffect(() => {
        setTextInput(previousText || '');
    }, [ previousText ]);

    const renderMedia = () => {
        if (!mediaPath) return null;
        const fullMediaPath = mediaPath.startsWith('http') ? mediaPath : `${urlBase}${mediaPath}`;
        const ext = mediaPath.split('.').pop().toLowerCase();

        if ([ 'jpg', 'jpeg', 'png', 'gif', 'webp' ].includes(ext)) {
            return (
                <div className="tfo-media-section">
                    <div className="tfo-media-container">
                        <img src={fullMediaPath} alt="Task media" className="tfo-media-img" />
                    </div>
                </div>
            );
        }
        if ([ 'mp4', 'webm', 'ogg' ].includes(ext)) {
            return (
                <div className="tfo-media-section">
                    <div className="tfo-media-container">
                        <video controls className="tfo-media-video">
                            <source src={fullMediaPath} type={`video/${ext}`} />
                            Your browser doesn&apos;t support video playback.
                        </video>
                    </div>
                </div>
            );
        }
        return null;
    };

    /* ── Error ── */
    if (error) {
        return (
            <>
                <AppHeader />
                <div className="tfo-root">
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div className="tfo-main">
                            <div className="tfo-progress-bar">
                                <div className="tfo-progress-filled" style={{ width: '0%' }} />
                                <div className="tfo-progress-remaining" />
                            </div>
                            <div className="tfo-content-area">
                                <aside className="tfo-sidebar" />
                                <main className="tfo-pane">
                                    <div className="tfo-error-container">
                                        <p>Lỗi tải nhiệm vụ. Vui lòng thử lại.</p>
                                        <button className="tfo-error-retry" onClick={onRetry}>
                                            Thử lại
                                        </button>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <>
                <AppHeader />
                <div className="tfo-root">
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div className="tfo-main">
                            <div className="tfo-progress-bar">
                                <div className="tfo-progress-filled" style={{ width: '0%' }} />
                                <div className="tfo-progress-remaining" />
                            </div>
                            <div className="tfo-content-area">
                                <aside className="tfo-sidebar" />
                                <main
                                    className="tfo-pane"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Spin size="large" />
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ── Progress ── */
    const activeSubtaskIndex = subtasks.findIndex((s) => s.id === selectedSubtaskId);
    const progressPercentage =
        subtasks.length > 0 && selectedSubtaskId ? ((activeSubtaskIndex + 1) / subtasks.length) * 100 : 0;

    // Kiểm tra xem Task Con hiện tại đã được hoàn thành chưa
    const isCompleted = taskStatus === 'completed' || hasCompleted;

    if (congratsData.show) {
        const fullFilePath = congratsData.filePath
            ? congratsData.filePath.startsWith('http')
                ? congratsData.filePath
                : `${AppConstants.contentRootUrl}${congratsData.filePath}`
            : null;
        const studentName = profile?.fullName || profile?.account?.fullName || 'Học viên';

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

                        {/* Certificate Mockup Frame */}
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
                                    <div className="tfo-cert-date">
                                        <span className="tfo-label">NGÀY CẤP</span>
                                        <span className="tfo-val">{new Date().toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="tfo-cert-seal">
                                        <div className="tfo-seal-circle">
                                            <span>OFFICIAL</span>
                                            <span>SEAL</span>
                                        </div>
                                    </div>
                                    <div className="tfo-cert-signature">
                                        <span className="tfo-label">BAN ĐIỀU HÀNH</span>
                                        <span className="tfo-signature-line">ITDream Edu</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="tfo-completion-actions">
                            {fullFilePath ? (
                                <button
                                    className="tfo-completion-btn tfo-completion-btn-primary"
                                    onClick={() => window.open(fullFilePath, '_blank', 'noopener,noreferrer')}
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
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Xem chứng chỉ
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
                                    Xem chứng chỉ (Chưa sẵn sàng)
                                </button>
                            )}
                            <button
                                className="tfo-completion-btn tfo-completion-btn-success"
                                onClick={() => {
                                    onCloseCongrats();
                                    if (simulationId) {
                                        navigate(`/simulations/${simulationId}`);
                                    } else {
                                        navigate('/simulations');
                                    }
                                }}
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
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Trở về Chi tiết Bài Mô phỏng
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AppHeader />
            <div className="tfo-root">
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="tfo-main">
                        {/* Progress bar */}
                        <div className="tfo-progress-bar">
                            <div className="tfo-progress-filled" style={{ width: `${progressPercentage}%` }} />
                            <div className="tfo-progress-remaining" />
                        </div>

                        {/* Sidebar + Content */}
                        <div className="tfo-content-area">
                            <TaskDoingSidebar
                                taskNumber={taskNumber}
                                taskLabel={taskLabel}
                                taskDescription={taskDescription}
                                companyLogo={companyLogo}
                                parentTasks={parentTasks}
                                selectedParentTaskId={selectedParentTaskId}
                                onSelectParentTask={onSelectParentTask}
                            />

                            <main className="tfo-pane">
                                <div className="tfo-pane-layout">
                                    <div className="tfo-pane-left">
                                        {/* Top bar */}
                                        <div className="tfo-pane-topbar">
                                            <div className="tfo-pane-title">{pageTitle}</div>
                                            {subtasks && subtasks.length > 0 && (
                                                <div className="tfo-step-pagination">
                                                    {subtasks.map((st, index) => (
                                                        <button
                                                            key={st.id}
                                                            className={`tfo-step-btn${st.id === selectedSubtaskId ? ' active' : ''}`}
                                                            onClick={() => onSelectSubtask(st.id)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="tfo-separator" />

                                        {/* Content */}
                                        <div className="tfo-task-content">
                                            <div className="tfo-task-heading-container">
                                                <div className="tfo-task-heading">{taskHeading}</div>
                                                {selectedSubtaskId && (
                                                    <button
                                                        className={`tfo-comments-toggle-btn${showComments ? ' active' : ''}`}
                                                        onClick={() => setShowComments(!showComments)}
                                                        title="Bình luận nhiệm vụ"
                                                    >
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            style={{ marginRight: 6 }}
                                                        >
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        <span>Bình luận ({comments.length})</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="tfo-task-body">
                                                {taskDescriptionContent && (
                                                    <p className="tfo-body-text" style={{ whiteSpace: 'pre-line' }}>
                                                        {taskDescriptionContent}
                                                    </p>
                                                )}

                                                {taskBody && (
                                                    <ContentRenderer
                                                        content={taskBody}
                                                        quizSubmissionMap={quizSubmissionMap}
                                                        questionMap={questionMap}
                                                        onQuizAnswerSubmit={onQuizAnswerSubmit}
                                                        hasCompleted={hasCompleted}
                                                    />
                                                )}

                                                {renderMedia()}

                                                {/* Nút Làm lại - hiển thị khi task đã hoàn thành hoặc đã có bài nộp */}

                                                {/* File upload section */}
                                                {requiresFileUpload && (
                                                    <div className="tfo-upload-section">
                                                        <FileDropzone
                                                            onFileChange={onFileChange}
                                                            previousFile={previousFile}
                                                            urlBase={urlBase}
                                                            disabled={isCompleted}
                                                        />
                                                    </div>
                                                )}

                                                {/* Text response section */}
                                                {requiresTextResponse && (
                                                    <div className="tfo-text-response-section">
                                                        <div className="tfo-text-response-label">
                                                            Câu trả lời của bạn
                                                        </div>
                                                        <textarea
                                                            className="tfo-text-response-textarea"
                                                            placeholder="Nhập câu trả lời của bạn ở đây..."
                                                            value={textInput}
                                                            onChange={(e) => setTextInput(e.target.value)}
                                                            disabled={isCompleted}
                                                            rows={6}
                                                        />
                                                        <div className="tfo-text-response-footer">
                                                            <button
                                                                className="tfo-action-btn tfo-action-btn-primary tfo-text-submit-btn"
                                                                onClick={() => onTextResponseSubmit(textInput)}
                                                                disabled={isCompleted || !textInput.trim()}
                                                            >
                                                                Nộp câu trả lời
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {showComments && (
                                        <CommentPanel
                                            comments={comments}
                                            loading={commentsLoading}
                                            profile={profile}
                                            onClose={() => setShowComments(false)}
                                            onSendComment={onSendComment}
                                            onUpdateComment={onUpdateComment}
                                        />
                                    )}
                                </div>
                            </main>
                        </div>
                    </div>

                    <FooterNav
                        onBack={onBack}
                        onNext={onNext}
                        canGoBack={canGoBack}
                        canGoNext={canGoNext}
                        isLastSubtask={isLastSubtask}
                    />
                </div>
            </div>

            {/* Loading overlay for certificate generation */}
            {isGeneratingCert && (
                <div className="tfo-cert-generating-overlay">
                    <div className="tfo-cert-generating-card">
                        <Spin size="large" />
                        <h3 style={{ marginTop: 24, color: '#111827', fontWeight: 600 }}>Đang tạo chứng chỉ...</h3>
                        <p style={{ marginTop: 8, color: '#4b5563', fontSize: 14 }}>
                            Hệ thống đang lưu trữ kết quả và tạo chứng chỉ hoàn thành bài mô phỏng cho bạn. Vui lòng
                            không đóng trình duyệt.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
