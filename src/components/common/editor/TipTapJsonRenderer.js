import React, { useEffect, useMemo, useRef, useState } from 'react';
import { blocksToMarkdoc, markdocToTipTapJson } from '@utils/markdocBlockConverter';

const MARKS = {
    bold: (ch) => <strong key="b">{ch}</strong>,
    italic: (ch) => <em key="i">{ch}</em>,
    underline: (ch) => <u key="u">{ch}</u>,
    strike: (ch) => <s key="s">{ch}</s>,
    code: (ch) => <code key="c">{ch}</code>,
    link: (ch, attrs) => (
        <a key="l" href={attrs?.href} target="_blank" rel="noreferrer">
            {ch}
        </a>
    ),
    highlight: (ch, attrs) => (
        <mark key="h" style={{ background: attrs?.color || '#feffb3' }}>
            {ch}
        </mark>
    ),
    subscript: (ch) => <sub key="sub">{ch}</sub>,
    superscript: (ch) => <sup key="sup">{ch}</sup>,
};

function renderTextNode(node) {
    const text = node.text || '';
    if (node.marks && node.marks.length > 0) {
        let content = text;
        for (const mark of node.marks) {
            const fn = MARKS[mark.type];
            if (fn) content = fn(content, mark.attrs);
        }
        return content;
    }
    return text;
}

/* ─────────────────────────── Interactive Quiz Block ─────────────────── */

function InteractiveQuizBlock({
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

/* ─────────────────────────── Node Rendering ─────────────────────────── */

function renderNode(node, index, quizCtx, onQuizAnswerSubmit, hasCompleted) {
    if (!node) return null;

    if (node.type === 'text') {
        return <React.Fragment key={index}>{renderTextNode(node)}</React.Fragment>;
    }

    const children = (node.content || []).map((child, i) =>
        renderNode(child, i, quizCtx, onQuizAnswerSubmit, hasCompleted),
    );

    switch (node.type) {
                    case 'doc':
                        return (
                            <div key={index} className="tfo-blocks-content">
                                {children}
                            </div>
                        );

                    case 'paragraph':
                        return <p key={index}>{children.length > 0 ? children : <br />}</p>;

                    case 'heading': {
                        const level = node.attrs?.level || 1;
                        const text = node.content?.map((c) => c.text || '').join('') || '';
                        const id = text
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9\u00C0-\u017F]+/g, '-');
                        const Tag = `h${level}`;
                        return (
                            <Tag key={index} id={id}>
                                {children}
                            </Tag>
                        );
                    }

                    case 'bulletList':
                        return <ul key={index}>{children}</ul>;

                    case 'orderedList':
                        return <ol key={index}>{children}</ol>;

                    case 'listItem':
                        return <li key={index}>{children}</li>;

                    case 'taskList':
                        return (
                            <ul key={index} data-type="taskList" className="tfo-task-list">
                                {children}
                            </ul>
                        );

                    case 'taskItem':
                        return (
                            <li key={index} className="tfo-task-item" data-checked={node.attrs?.checked}>
                                <input type="checkbox" checked={!!node.attrs?.checked} readOnly />
                                <span>{children}</span>
                            </li>
                        );

                    case 'codeBlock': {
                        const lang = node.attrs?.language;
                        return (
                            <pre key={index} className={lang ? `language-${lang}` : ''}>
                                <code>{node.content?.[0]?.text || ''}</code>
                            </pre>
                        );
                    }

                    case 'blockquote':
                        return <blockquote key={index}>{children}</blockquote>;

                    case 'horizontalRule':
                        return <hr key={index} />;

                    case 'image':
                        return (
                            <img
                                key={index}
                                src={node.attrs?.src}
                                alt={node.attrs?.alt || ''}
                                title={node.attrs?.title}
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        );

                    case 'hardBreak':
                        return <br key={index} />;

                    case 'callout':
                        return (
                            <div key={index} className="tfo-block-callout">
                                <span className="tfo-block-callout-icon">{node.attrs?.icon || '💡'}</span>
                                <div className="tfo-block-callout-text">{children}</div>
                            </div>
                        );

                    case 'step':
                        return (
                            <div key={index} className="tfo-block-step">
                                <div className="tfo-block-step-badge">{index + 1}</div>
                                <div className="tfo-block-step-content">
                                    {node.attrs?.label && <span className="tfo-block-step-label">{node.attrs.label}</span>}
                                    <div className="tfo-block-step-body">{children}</div>
                                </div>
                            </div>
                        );

                    case 'section':
                        return (
                            <div key={index} className="tfo-block-section">
                                <div className="tfo-block-section-header">
                                    <span className="tfo-block-section-icon">{node.attrs?.icon || '🎓'}</span>
                                    <span className="tfo-block-section-title">{node.attrs?.title}</span>
                                </div>
                                <div className="tfo-block-section-content">{children}</div>
                            </div>
                        );

                    case 'quiz': {
                        const options = (node.content || []).filter((c) => c.type === 'option');
                        const parsedOptions = options.map((o) => ({
                            option: o.content?.[0]?.text || '',
                            answer: o.attrs?.correct === true,
                        }));
                        const questionKey = (node.attrs?.question || '').trim();
                        const dataQId = node.attrs?.dataQuestionCode || '';
                        const questionId = dataQId ? quizCtx?.questionMap?.[dataQId] : quizCtx?.questionMap?.[questionKey];
                        const studentAnswer = quizCtx?.quizSubmissionMap?.[questionId];

                        if (onQuizAnswerSubmit) {
                            // Interactive Mode
                            const block = {
                                question: node.attrs?.question || '',
                                options: parsedOptions,
                            };
                            return (
                                <InteractiveQuizBlock
                                    key={index}
                                    block={block}
                                    submittedAnswer={studentAnswer}
                                    questionId={questionId}
                                    onQuizAnswerSubmit={onQuizAnswerSubmit}
                                    hasCompleted={hasCompleted}
                                />
                            );
                        }

                        // Read-Only Mode (CMS Review style)
                        const hasAnswerInfo = !!studentAnswer;
                        const isCorrect = studentAnswer?.isCorrect === true;

                        let quizClass = 'tfo-block-quiz';
                        if (quizCtx?.quizSubmissionMap) {
                            quizClass += hasAnswerInfo ? (isCorrect ? ' quiz-correct' : ' quiz-wrong') : '';
                        }

                        const optionElements = parsedOptions.map((opt, i) => {
                            const correct = opt.answer === true;
                            const letter = String.fromCharCode(65 + i);
                            const text = opt.option;
                            const isSelected = studentAnswer && studentAnswer.answer === text;
                            let optClass = 'tfo-quiz-option';
                            if (quizCtx?.quizSubmissionMap) {
                                if (isSelected) optClass += ' selected';
                                if (correct) optClass += ' answer-correct';
                                if (isSelected && !correct) optClass += ' answer-wrong';
                            } else if (correct) {
                                optClass += ' answer-correct';
                            }
                            return (
                                <div key={i} className={optClass}>
                                    <span className="tfo-quiz-option-letter">{letter}.</span>
                                    <span className="tfo-quiz-option-text">{text}</span>
                                    {quizCtx?.quizSubmissionMap && correct && (
                                        <span className="tfo-quiz-option-badge correct">✓ Đúng</span>
                                    )}
                                    {quizCtx?.quizSubmissionMap && isSelected && !correct && (
                                        <span className="tfo-quiz-option-badge wrong">✗ Học viên chọn</span>
                                    )}
                                    {!quizCtx?.quizSubmissionMap && correct && (
                                        <span className="tfo-quiz-option-badge correct">✓ Đáp án đúng</span>
                                    )}
                                </div>
                            );
                        });

                        return (
                            <div key={index} className={quizClass}>
                                <div className="tfo-block-quiz-question">
                                    <span className="tfo-block-quiz-icon">❓</span>
                                    <span className="tfo-block-quiz-text">{node.attrs?.question}</span>
                                </div>
                                <div className="tfo-block-quiz-options">{optionElements}</div>
                                {quizCtx?.quizSubmissionMap && (
                                    <div className="tfo-block-quiz-footer">
                                        {hasAnswerInfo ? (
                                            <span className={`tfo-quiz-result-label ${isCorrect ? 'correct' : 'wrong'}`}>
                                                {isCorrect ? '🎉 Học viên trả lời chính xác!' : '😅 Học viên trả lời chưa đúng!'}
                                            </span>
                                        ) : (
                                            <span className="tfo-quiz-result-label" style={{ color: '#8c8c8c' }}>
                                    Học viên chưa làm câu này.
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    default:
                        return <React.Fragment key={index}>{children}</React.Fragment>;
    }
}

export default function TipTapJsonRenderer({
    content,
    quizSubmissionMap,
    questionMap,
    onQuizAnswerSubmit,
    hasCompleted,
    onQuestionRendered,
}) {
    const json = useMemo(() => {
        if (!content) return { type: 'doc', content: [] };

        let parsed = content;
        if (typeof content === 'string') {
            const trimmed = content.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    parsed = JSON.parse(trimmed);
                } catch {
                    return markdocToTipTapJson(content);
                }
            } else {
                return markdocToTipTapJson(content);
            }
        }

        if (parsed && parsed.type === 'doc') {
            return parsed;
        }

        if (Array.isArray(parsed)) {
            const markdocStr = blocksToMarkdoc(parsed);
            return markdocToTipTapJson(markdocStr);
        }

        return { type: 'doc', content: [] };
    }, [ content ]);

    const quizCtx = useMemo(() => {
        return {
            quizSubmissionMap: quizSubmissionMap || {},
            questionMap: questionMap || {},
        };
    }, [ quizSubmissionMap, questionMap ]);

    // Extract inline question IDs inside useMemo to avoid state setting during rendering
    const inlineQuestionIds = useMemo(() => {
        const ids = new Set();
        const walk = (nodes) => {
            (nodes || []).forEach((n) => {
                if (n.type === 'quiz') {
                    const questionKey = (n.attrs?.question || '').trim();
                    const dataQId = n.attrs?.dataQuestionCode || '';
                    const questionId = dataQId ? quizCtx?.questionMap?.[dataQId] : quizCtx?.questionMap?.[questionKey];
                    if (questionId) {
                        ids.add(String(questionId));
                    }
                }
                if (n.content) walk(n.content);
            });
        };
        walk(json.content);
        return Array.from(ids);
    }, [ json, quizCtx ]);

    // Notify parent component about rendered questions in useEffect
    useEffect(() => {
        if (onQuestionRendered) {
            onQuestionRendered(inlineQuestionIds);
        }
    }, [ inlineQuestionIds, onQuestionRendered ]);

    const rendered = useMemo(() => {
        return (json.content || []).map((node, i) => renderNode(node, i, quizCtx, onQuizAnswerSubmit, hasCompleted));
    }, [ json, quizCtx, onQuizAnswerSubmit, hasCompleted ]);

    if (!content) {
        return (
            <p className="tfo-empty-content" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                Không có nội dung.
            </p>
        );
    }

    return <div className="block-editor-preview-container tfo-blocks-content">{rendered}</div>;
}
