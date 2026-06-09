import React, { useMemo, useState } from 'react';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Spin } from 'antd';

import TaskDoingSidebar from './TaskDoingSidebar';

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

        if (h1) { flushList(); elements.push(<h2 key={key++} className="tfo-block-h1">{h1[1]}</h2>); return; }
        if (h2) { flushList(); elements.push(<h2 key={key++} className="tfo-block-h2">{h2[1]}</h2>); return; }
        if (h3) { flushList(); elements.push(<h3 key={key++} className="tfo-block-h3">{h3[1]}</h3>); return; }
        if (li)    { listItems.push(li[1]); return; }
        if (blank) { flushList(); return; }
        flushList();
        elements.push(<p key={key++} className="tfo-block-text" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
    });
    flushList();
    return <div className="tfo-markdown-content">{elements}</div>;
}

/* ─────────────────────────── Quiz Block (interactive) ─────────────────── */

function QuizBlock({ block }) {
    const [ selected, setSelected ]   = useState(null);
    const [ submitted, setSubmitted ] = useState(false);

    const correct   = (block.options || []).findIndex((o) => o.answer === true);
    const isCorrect = submitted && selected === correct;

    const handleSubmit = () => {
        if (selected === null) return;
        setSubmitted(true);
    };

    const handleReset = () => {
        setSelected(null);
        setSubmitted(false);
    };

    return (
        <div className={`tfo-block-quiz${submitted ? (isCorrect ? ' quiz-correct' : ' quiz-wrong') : ''}`}>
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
                    if (selected === oi)                          cls += ' selected';
                    if (submitted && oi === correct)              cls += ' answer-correct';
                    if (submitted && selected === oi && oi !== correct) cls += ' answer-wrong';

                    return (
                        <button
                            key={oi}
                            className={cls}
                            disabled={submitted}
                            onClick={() => !submitted && setSelected(oi)}
                        >
                            <span className="tfo-quiz-option-letter">{letter}.</span>
                            <span className="tfo-quiz-option-text">{opt.option}</span>
                            {submitted && oi === correct && (
                                <span className="tfo-quiz-option-badge correct">✓ Đúng</span>
                            )}
                            {submitted && selected === oi && oi !== correct && (
                                <span className="tfo-quiz-option-badge wrong">✗ Sai</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="tfo-block-quiz-footer">
                {!submitted ? (
                    <button
                        className="tfo-quiz-submit-btn"
                        disabled={selected === null}
                        onClick={handleSubmit}
                    >
                        Kiểm tra đáp án
                    </button>
                ) : (
                    <div className="tfo-quiz-result-row">
                        <span className={`tfo-quiz-result-label ${isCorrect ? 'correct' : 'wrong'}`}>
                            {isCorrect ? '🎉 Chính xác!' : '😅 Chưa đúng, hãy thử lại!'}
                        </span>
                        <button className="tfo-quiz-retry-btn" onClick={handleReset}>
                            Làm lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────── Block Item ─────────────────────────── */

function BlockItem({ block, idx, allBlocks }) {
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

                    case 'quiz':
                        return <QuizBlock block={block} />;

                    default:
                        return null;
    }
}

/* ─────────────────────────── Blocks content ─────────────────────────── */

function BlocksContent({ blocksJson }) {
    const blocks = useMemo(() => {
        try { return JSON.parse(blocksJson); }
        catch { return []; }
    }, [ blocksJson ]);

    return (
        <div className="tfo-blocks-content">
            {blocks.map((block, idx) => (
                <BlockItem key={block.id || idx} block={block} idx={idx} allBlocks={blocks} />
            ))}
        </div>
    );
}

/* ─────────────────────────── Content Router ─────────────────────────── */

function ContentRenderer({ content }) {
    const type = useMemo(() => detectContentType(content), [ content ]);
    if (type === 'empty')    return <p className="tfo-empty-content">Không có nội dung.</p>;
    if (type === 'blocks')   return <BlocksContent blocksJson={content} />;
    if (type === 'markdown') return <MarkdownContent text={content} />;
    return <PlainTextContent text={content} />;
}

/* ─────────────────────────── File Dropzone ─────────────────────────── */

function FileDropzone({ onFileChange = () => {} }) {
    const [ dragging, setDragging ] = useState(false);
    const [ file, setFile ]         = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) { setFile(f); onFileChange(f); }
    };

    const handleChange = (e) => {
        const f = e.target.files?.[0];
        if (f) { setFile(f); onFileChange(f); }
    };

    return (
        <div className="tfo-upload-card">
            <div className="tfo-upload-label">Nộp Bài Làm Của Bạn</div>
            <label
                className={`tfo-dropzone${dragging ? ' dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <input type="file" style={{ display: 'none' }} onChange={handleChange} />
                <svg className="tfo-dropzone-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v10M4 5l4-4 4 4" stroke="#5f5e5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="#5f5e5e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {file ? (
                    <span className="tfo-file-chosen">{file.name}</span>
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

function FooterNav({ onBack = () => {}, onNext = () => {}, canGoBack = true, canGoNext = true }) {
    return (
        <footer className="tfo-footer-nav">
            <div className="tfo-footer-inner">
                <div className="tfo-footer-buttons">
                    <button className="tfo-btn-back" onClick={onBack} disabled={!canGoBack}>Back</button>
                    <button className="tfo-btn-next" onClick={onNext} disabled={!canGoNext}>Next</button>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

/**
 * TaskDoingPage
 * Renders task content using the BlockEditor block format.
 * Supports: text, h1-h3, bullet, numbered, divider, callout, code, meta, section, step, quiz.
 */
export default function TaskDoingPage({
    // Loading/Error
    loading = false,
    error   = null,
    onRetry = () => {},

    // Sidebar
    taskNumber          = 1,
    taskLabel           = 'Nhiệm vụ',
    taskDescription     = '',
    companyLogo         = null,
    parentTasks         = [],
    selectedParentTaskId = null,
    onSelectParentTask  = () => {},

    // Subtask navigation
    subtasks          = [],
    selectedSubtaskId = null,
    onSelectSubtask   = () => {},

    // Content
    pageTitle              = 'Nhiệm vụ',
    taskHeading            = 'Đang tải...',
    taskBody               = '',
    taskDescriptionContent = '',
    mediaPath              = null,
    urlBase                = '',

    // Progress
    taskStatus = 'not_started', // 'not_started' | 'in_progress' | 'completed'
    errorCount = 0,

    // Navigation
    canGoBack       = false,
    canGoNext       = false,
    onBack          = () => {},
    onNext          = () => {},
    onFileChange    = () => {},
    onStartTask     = () => {},
    onCompleteTask  = () => {},
    onResetTask     = () => {},
}) {
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
                                        <button className="tfo-error-retry" onClick={onRetry}>Thử lại</button>
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
                                <main className="tfo-pane" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    const progressPercentage = subtasks.length > 0 && selectedSubtaskId
        ? ((activeSubtaskIndex + 1) / subtasks.length) * 100
        : 0;

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
                                <div className="tfo-pane-layout" style={{ width: '100%' }}>
                                    <div className="tfo-pane-left" style={{ width: '100%' }}>
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
                                            <div className="tfo-task-heading">{taskHeading}</div>

                                            <div className="tfo-task-body">
                                                {taskDescriptionContent && (
                                                    <p className="tfo-body-text" style={{ whiteSpace: 'pre-line' }}>
                                                        {taskDescriptionContent}
                                                    </p>
                                                )}

                                                {taskBody && <ContentRenderer content={taskBody} />}

                                                {renderMedia()}

                                                {/* Task action buttons */}
                                                <div className="tfo-task-actions">
                                                    {taskStatus === 'not_started' && (
                                                        <button className="tfo-action-btn tfo-action-btn-primary" onClick={onStartTask}>
                                                            Bắt đầu Nhiệm vụ
                                                        </button>
                                                    )}
                                                    {taskStatus === 'in_progress' && (
                                                        <>
                                                            <button className="tfo-action-btn tfo-action-btn-primary" onClick={onCompleteTask}>
                                                                Hoàn thành Nhiệm vụ
                                                            </button>
                                                            {errorCount > 0 && (
                                                                <div className="tfo-action-info">Lỗi: {errorCount}</div>
                                                            )}
                                                        </>
                                                    )}
                                                    {taskStatus === 'completed' && (
                                                        <>
                                                            <div className="tfo-action-completed">✓ Nhiệm vụ đã Hoàn thành</div>
                                                            <button className="tfo-action-btn tfo-action-btn-secondary" onClick={onResetTask}>
                                                                Làm lại Nhiệm vụ
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="tfo-upload-section">
                                                    <FileDropzone onFileChange={onFileChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>

                    <FooterNav onBack={onBack} onNext={onNext} canGoBack={canGoBack} canGoNext={canGoNext} />
                </div>
            </div>
        </>
    );
}
