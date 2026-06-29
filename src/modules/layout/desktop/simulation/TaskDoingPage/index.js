import React, { useEffect, useMemo, useRef, useState } from 'react';
import TipTapJsonRenderer from '@components/common/editor/TipTapJsonRenderer';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Spin } from 'antd';

import CommentPanel from '../components/CommentPanel';
import TaskDoingSidebar from '../components/TaskDoingSidebar';

import './TaskDoingPage.scss';

/* ─────────────────────────── helpers ─────────────────────────── */

function detectContentType(content) {
    if (!content || typeof content !== 'string') return 'empty';
    const trimmed = content.trim();
    if (!trimmed) return 'empty';
    if (trimmed.startsWith('[')) {
        try {
            const p = JSON.parse(trimmed);
            if (Array.isArray(p)) return 'blocks';
        } catch {
            // ignore
        }
    }
    if (trimmed.startsWith('{"type":"doc"') || /{%\s*(callout|step|section|quiz)\b/.test(trimmed)) return 'tiptap';
    if (/^#{1,3}\s|\*\s|\*\*/m.test(trimmed)) return 'markdown';
    return 'text';
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseInline(text) {
    if (!text) return '';
    const escaped = escapeHtml(text);
    return escaped
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
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const correct = (block.options || []).findIndex((o) => o.answer === true);
    const savedAnswer = submittedAnswer?.answer;
    const savedOptionIndex = (block.options || []).findIndex(
        (o) => o.option === savedAnswer || o.value === savedAnswer,
    );

    const prevQuestionIdRef = useRef(questionId);
    const prevSavedAnswerRef = useRef(savedAnswer);

    useEffect(() => {
        const questionChanged = prevQuestionIdRef.current !== questionId;
        const resetTriggered = Boolean(prevSavedAnswerRef.current) && !savedAnswer;

        if (questionChanged || resetTriggered) {
            setIsRetrying(false);
            setSelected(null);
            setSubmitted(false);
        }

        prevQuestionIdRef.current = questionId;
        prevSavedAnswerRef.current = savedAnswer;
    }, [questionId, savedAnswer]);

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
                    <div className="tfo-block-step-badge">{idx + 1}</div>
                    <div className="tfo-block-step-content">
                        <span className="tfo-block-step-label">{block.label}</span>
                        <span className="tfo-block-step-body">{renderStepBody(block.body)}</span>
                    </div>
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
    }, [blocksJson]);

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

/* ─────────────────────── TipTap / Markdoc helpers ─────────────────── */

function parseMarkdocAttrs(str) {
    const attrs = {};
    const re = /(\w+)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(str)) !== null) attrs[m[1]] = m[2];
    return attrs;
}

function extractBlocksFromMarkdoc(markdoc) {
    const blocks = [];
    const tagRe = /\{%\s*(callout|step|section|quiz)\b([^%]*?)%}([\s\S]*?){%\s*\/\1\s*%}/g;
    let lastIdx = 0;
    let match;

    while ((match = tagRe.exec(markdoc)) !== null) {
        const before = markdoc.slice(lastIdx, match.index).trim();
        if (before) blocks.push({ type: 'text', content: before });

        const tag = match[1];
        const attrs = parseMarkdocAttrs(match[2]);
        const body = match[3];

        switch (tag) {
            case 'callout':
                blocks.push({ type: 'callout', icon: attrs.icon || '💡', content: body.trim() });
                break;
            case 'step':
                blocks.push({ type: 'step', label: attrs.label || '', body: body.trim() });
                break;
            case 'section':
                blocks.push({
                    type: 'section',
                    icon: attrs.icon || '🎓',
                    title: attrs.title || '',
                    bullets: body
                        .split('\n')
                        .filter((l) => l.trim())
                        .map((l) => l.replace(/^[-*]\s*/, '').trim()),
                });
                break;
            case 'quiz': {
                const optRe = /\{%\s*option\b([^%]*?)%}([\s\S]*?){%\s*\/option\s*%}/g;
                const options = [];
                let om;
                while ((om = optRe.exec(body)) !== null) {
                    const optAttrs = parseMarkdocAttrs(om[1]);
                    const optText = om[2].trim();
                    options.push({
                        answer: optAttrs.correct === 'true',
                        option: optText,
                        value: optText,
                    });
                }
                if (options.length > 0) {
                    blocks.push({ type: 'quiz', question: attrs.question || '', options });
                }
                break;
            }
        }
        lastIdx = match.index + match[0].length;
    }

    const after = markdoc.slice(lastIdx).trim();
    if (after) blocks.push({ type: 'text', content: after });

    return blocks.length > 0 ? blocks : null;
}

/* ─────────────────────────── Content Router ─────────────────────────── */

function flattenTipTapText(node) {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    return (node.content || []).map(flattenTipTapText).join(' ');
}

function ContentRenderer({
    content,
    quizSubmissionMap = {},
    questionMap = {},
    onQuizAnswerSubmit = () => {},
    hasCompleted = false,
    onQuestionRendered = () => {},
}) {
    return (
        <TipTapJsonRenderer
            content={content}
            quizSubmissionMap={quizSubmissionMap}
            questionMap={questionMap}
            onQuizAnswerSubmit={onQuizAnswerSubmit}
            hasCompleted={hasCompleted}
            onQuestionRendered={onQuestionRendered}
        />
    );
}

/* ─────────────────────────── File Dropzone ─────────────────────────── */

const isExternalUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^(https?:\/\/|www\.)/i.test(str.trim());
};

function FileDropzone({ onFileChange = () => {}, previousFile = null, urlBase = '', disabled = false }) {
    // Xác định mode mặc định dựa vào submission trước đó
    const defaultMode = previousFile && isExternalUrl(previousFile) ? 'link' : 'file';
    const [mode, setMode] = useState(defaultMode);
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [linkInput, setLinkInput] = useState('');

    useEffect(() => {
        setFile(null);
        setLinkInput('');
        // Khi previousFile thay đổi, cập nhật lại mode mặc định
        if (previousFile && isExternalUrl(previousFile)) {
            setMode('link');
        } else if (previousFile) {
            setMode('file');
        }
    }, [previousFile]);

    const handleDrop = (e) => {
        e.preventDefault();
        if (disabled || mode !== 'file') return;
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    const handleFileChange = (e) => {
        if (disabled) return;
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    const handleLinkSubmit = () => {
        if (disabled || !linkInput.trim()) return;
        onFileChange(linkInput.trim());
        setLinkInput('');
    };

    const handleLinkKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLinkSubmit();
        }
    };

    const getFileName = (path) => {
        if (!path) return '';
        const parts = path.split('/');
        return decodeURIComponent(parts[parts.length - 1]);
    };

    const displayFileName = file ? file.name : previousFile && mode === 'file' ? getFileName(previousFile) : '';

    return (
        <div className={`tfo-upload-card${disabled ? ' disabled' : ''}`}>
            <div className="tfo-upload-label">Nộp Bài Làm Của Bạn</div>

            {/* Tab switcher - chỉ hiển thị khi chưa hoàn thành */}
            {!disabled && (
                <div className="tfo-submit-mode-tabs">
                    <button
                        type="button"
                        className={`tfo-submit-mode-tab${mode === 'file' ? ' active' : ''}`}
                        onClick={() => setMode('file')}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                            <path
                                d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6L9 1z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9 1v5h5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Tải file lên
                    </button>
                    <button
                        type="button"
                        className={`tfo-submit-mode-tab${mode === 'link' ? ' active' : ''}`}
                        onClick={() => setMode('link')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <path
                                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Nhập đường dẫn / URL
                    </button>
                </div>
            )}

            {/* File upload mode */}
            {mode === 'file' && (
                <label
                    className={`tfo-dropzone${dragging ? ' dragging' : ''}${disabled ? ' disabled' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!disabled) setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    {!disabled && <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />}
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
            )}

            {/* Link / path input mode */}
            {mode === 'link' && (
                <div className="tfo-link-input-wrapper">
                    {previousFile && isExternalUrl(previousFile) && (
                        <div className="tfo-link-submitted">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <path
                                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                                    stroke="#0062E3"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                                    stroke="#0062E3"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="tfo-link-submitted-label">Đường dẫn đã nộp:</span>
                            <a
                                href={previousFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tfo-file-download-link tfo-link-submitted-url"
                            >
                                {previousFile}
                            </a>
                        </div>
                    )}
                    {previousFile && !isExternalUrl(previousFile) && (
                        <div className="tfo-link-submitted">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <path
                                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                                    stroke="#0062E3"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                                    stroke="#0062E3"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="tfo-link-submitted-label">Đường dẫn đã nộp:</span>
                            <span className="tfo-link-submitted-path">{previousFile}</span>
                        </div>
                    )}
                    {!disabled && (
                        <div className="tfo-link-input-row">
                            <input
                                type="text"
                                className="tfo-link-input"
                                placeholder="Nhập URL hoặc đường dẫn file (vd: https://drive.google.com/...)"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                onKeyDown={handleLinkKeyDown}
                                disabled={disabled}
                            />
                            <button
                                type="button"
                                className="tfo-link-submit-btn"
                                onClick={handleLinkSubmit}
                                disabled={disabled || !linkInput.trim()}
                            >
                                Nộp
                            </button>
                        </div>
                    )}
                </div>
            )}
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
    quizBlocks = [],

    // Educator reviews
    currentSubtaskReviews = [],

    // Certificate and congrats
    isGeneratingCert = false,

    // Profile details
    profile = {},

    // Comments
    comments = [],
    commentsLoading = false,
    showComments = false,
    setShowComments = () => {},
    onSendComment = () => {},
    onUpdateComment = () => {},
    onDeleteComment = () => {},
}) {
    const [textInput, setTextInput] = useState('');
    const [inlineQuestionIds, setInlineQuestionIds] = useState([]);

    useEffect(() => {
        setTextInput(previousText || '');
    }, [previousText]);

    useEffect(() => {
        setInlineQuestionIds([]);
    }, [selectedSubtaskId]);

    const renderMedia = () => {
        if (!mediaPath) return null;
        const fullMediaPath = mediaPath.startsWith('http') ? mediaPath : `${urlBase}${mediaPath}`;
        const ext = mediaPath.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            return (
                <div className="tfo-media-section">
                    <div className="tfo-media-container">
                        <img src={fullMediaPath} alt="Task media" className="tfo-media-img" />
                    </div>
                </div>
            );
        }
        if (['mp4', 'webm', 'ogg'].includes(ext)) {
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
    const isNavigationBlocked = !isCompleted;

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
                                isNavigationBlocked={isNavigationBlocked}
                            />

                            <main className="tfo-pane">
                                <div className="tfo-pane-layout">
                                    <div className="tfo-pane-left">
                                        {/* Top bar */}
                                        <div className="tfo-pane-topbar">
                                            <div className="tfo-pane-title">{pageTitle}</div>
                                            {subtasks && subtasks.length > 0 && (
                                                <div className="tfo-step-pagination">
                                                    {subtasks.map((st, index) => {
                                                        const isCurrent = st.id === selectedSubtaskId;
                                                        return (
                                                            <button
                                                                key={st.id}
                                                                className={`tfo-step-btn${isCurrent ? ' active' : ''}`}
                                                                onClick={() => {
                                                                    if (isNavigationBlocked && !isCurrent) return;
                                                                    onSelectSubtask(st.id);
                                                                }}
                                                                disabled={isNavigationBlocked && !isCurrent}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        );
                                                    })}
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
                                                        onQuestionRendered={setInlineQuestionIds}
                                                    />
                                                )}

                                                {/* Render questions fetched from API */}
                                                {quizBlocks && quizBlocks.length > 0 && (
                                                    <div className="tfo-blocks-content" style={{ marginTop: 24 }}>
                                                        {quizBlocks
                                                            .filter((block) => {
                                                                const questionId = block.id
                                                                    ? String(block.id)
                                                                    : block.question
                                                                      ? questionMap[block.question.trim()]
                                                                      : null;
                                                                return !inlineQuestionIds.includes(String(questionId));
                                                            })
                                                            .map((block, idx) => {
                                                                const questionId = block.id
                                                                    ? String(block.id)
                                                                    : block.question
                                                                      ? questionMap[block.question.trim()]
                                                                      : null;
                                                                return (
                                                                    <QuizBlock
                                                                        key={questionId || idx}
                                                                        block={block}
                                                                        submittedAnswer={
                                                                            questionId
                                                                                ? quizSubmissionMap[questionId]
                                                                                : null
                                                                        }
                                                                        questionId={questionId}
                                                                        onQuizAnswerSubmit={onQuizAnswerSubmit}
                                                                        hasCompleted={hasCompleted}
                                                                    />
                                                                );
                                                            })}
                                                    </div>
                                                )}

                                                {renderMedia()}

                                                {/* Educator feedback for this subtask */}
                                                {currentSubtaskReviews && currentSubtaskReviews.length > 0 && (
                                                    <div className="tfo-subtask-feedback-card">
                                                        <div className="tfo-subtask-feedback-header">
                                                            <span className="tfo-subtask-feedback-icon">💬</span>
                                                            <span className="tfo-subtask-feedback-title">
                                                                Nhận xét từ Giảng viên
                                                            </span>
                                                        </div>
                                                        <div className="tfo-subtask-feedback-comments">
                                                            {currentSubtaskReviews.map((review) => (
                                                                <div
                                                                    key={review.id}
                                                                    className="tfo-subtask-feedback-comment-item"
                                                                >
                                                                    {review.content}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

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
                                                            disabled={isCompleted || Boolean(previousText)}
                                                            rows={6}
                                                        />
                                                        <div className="tfo-text-response-footer">
                                                            <button
                                                                className="tfo-action-btn tfo-action-btn-primary tfo-text-submit-btn"
                                                                onClick={() => onTextResponseSubmit(textInput)}
                                                                disabled={
                                                                    isCompleted ||
                                                                    Boolean(previousText) ||
                                                                    !textInput.trim()
                                                                }
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
                                            taskId={selectedSubtaskId}
                                            comments={comments}
                                            loading={commentsLoading}
                                            profile={profile}
                                            onClose={() => setShowComments(false)}
                                            onSendComment={onSendComment}
                                            onUpdateComment={onUpdateComment}
                                            onDeleteComment={onDeleteComment}
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
