import React, { useMemo } from 'react';

import styles from './TaskPanel.module.scss';

// ─────────────────────────────────────────
// Helpers: detect content type
// ─────────────────────────────────────────
function detectContentType(content) {
    if (!content || typeof content !== 'string') return 'empty';
    const trimmed = content.trim();
    // JSON blocks array
    if (trimmed.startsWith('[')) {
        try {
            const p = JSON.parse(trimmed);
            if (Array.isArray(p)) return 'blocks';
        } catch (e) {
            // ignore
        }
    }
    // Markdown — has ## or * or **
    if (/^#{1,3}\s|^\*\s|\*\*/m.test(trimmed)) return 'markdown';
    return 'text';
}

// ─────────────────────────────────────────
// Renderer: plain text
// ─────────────────────────────────────────
function PlainTextContent({ text }) {
    return (
        <div className={styles.plainText}>
            {text.split('\n\n').map((para, i) => (
                <p key={i}>{para.trim()}</p>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────
// Renderer: markdown (no lib, manual parse)
// ─────────────────────────────────────────
function parseInline(text) {
    // **bold**, `code`, basic links
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function MarkdownContent({ text }) {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let key = 0;

    const flushList = () => {
        if (listItems.length) {
            elements.push(
                <ul key={key++} className={styles.mdList}>
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
                <h2 key={key++} className={styles.mdH1}>
                    {h1[1]}
                </h2>,
            );
            return;
        }
        if (h2) {
            flushList();
            elements.push(
                <h2 key={key++} className={styles.mdH2}>
                    {h2[1]}
                </h2>,
            );
            return;
        }
        if (h3) {
            flushList();
            elements.push(
                <h3 key={key++} className={styles.mdH3}>
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
            <p key={key++} className={styles.mdPara} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />,
        );
    });
    flushList();
    return <div className={styles.markdownContent}>{elements}</div>;
}

// ─────────────────────────────────────────
// Renderer: JSON blocks
// ─────────────────────────────────────────
function BlocksContent({ blocksJson }) {
    const blocks = useMemo(() => {
        try {
            return JSON.parse(blocksJson);
        } catch {
            return [];
        }
    }, [ blocksJson ]);

    return (
        <div className={styles.blocksContent}>
            {blocks.map((block, idx) => (
                <BlockItem key={idx} block={block} idx={idx} allBlocks={blocks} />
            ))}
        </div>
    );
}

function BlockItem({ block, idx, allBlocks }) {
    switch (block.type) {
                    case 'meta':
                        return (
                            <div className={styles.blockMeta}>
                                <span className={styles.blockMetaVal}>{block.duration}</span>
                                <span className={styles.blockMetaDot}>·</span>
                                <span className={styles.blockMetaVal}>{block.level}</span>
                            </div>
                        );

                    case 'section':
                        return (
                            <div className={styles.blockSection}>
                                <div className={styles.blockSectionHeader}>
                                    <span className={styles.blockSectionIcon}>{block.icon}</span>
                                    <span className={styles.blockSectionTitle}>{block.title}</span>
                                </div>
                                <ul className={styles.blockSectionList}>
                                    {(block.bullets || [])
                                        .filter(Boolean)
                                        .map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                </ul>
                            </div>
                        );

                    case 'text':
                        return <p className={styles.blockText}>{block.content}</p>;

                    case 'h1':
                        return <h2 className={styles.blockH1}>{block.content}</h2>;

                    case 'h2':
                        return <h3 className={styles.blockH2}>{block.content}</h3>;

                    case 'h3':
                        return <h4 className={styles.blockH3}>{block.content}</h4>;

                    case 'bullet':
                        return (
                            <div className={styles.blockBulletWrap}>
                                <span className={styles.blockBulletDot}>•</span>
                                <span className={styles.blockBulletText}>{block.content}</span>
                            </div>
                        );

                    case 'numbered': {
                        const num = allBlocks.filter((b, i) => b.type === 'numbered' && i <= idx).length;
                        return (
                            <div className={styles.blockBulletWrap}>
                                <span className={styles.blockNumLabel}>{num}.</span>
                                <span className={styles.blockBulletText}>{block.content}</span>
                            </div>
                        );
                    }

                    case 'divider':
                        return <hr className={styles.blockDivider} />;

                    case 'callout':
                        return (
                            <div className={styles.blockCallout}>
                                <span className={styles.blockCalloutIcon}>{block.icon}</span>
                                <span className={styles.blockCalloutText}>{block.content}</span>
                            </div>
                        );

                    case 'code':
                        return (
                            <div className={styles.blockCode}>
                                <pre>{block.content}</pre>
                            </div>
                        );

                    case 'step':
                        return (
                            <div className={styles.blockStep}>
                                <span className={styles.blockStepLabel}>{block.label}:</span>
                                <span className={styles.blockStepBody}>{block.body}</span>
                            </div>
                        );

                    default:
                        return null;
    }
}

// ─────────────────────────────────────────
// Smart content renderer
// ─────────────────────────────────────────
function ContentRenderer({ content }) {
    const type = useMemo(() => detectContentType(content), [ content ]);
    if (type === 'empty') return <p className={styles.emptyContent}>Không có nội dung.</p>;
    if (type === 'blocks') return <BlocksContent blocksJson={content} />;
    if (type === 'markdown') return <MarkdownContent text={content} />;
    return <PlainTextContent text={content} />;
}

// ─────────────────────────────────────────
// Task sidebar item
// ─────────────────────────────────────────
function TaskSidebarItem({ task, isActive, onClick, num }) {
    const name = task.title || task.name || '';
    const isNumbered = num !== null;

    return (
        <button className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`} onClick={onClick}>
            <div
                className={`${styles.sidebarBadge} ${isActive ? styles.sidebarBadgeActive : ''} ${
                    !isNumbered ? styles.sidebarBadgeFlag : ''
                }`}
            >
                {isNumbered ? (
                    <span className={styles.sidebarNum}>{num}</span>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={styles.flagIcon}>
                        <path
                            d="M3 1v12M3 1h7l-2 3.5 2 3.5H3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            <span className={styles.sidebarName}>{name}</span>
        </button>
    );
}

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────
function TaskPanel({ tasks = [], activeTaskId, onSelectTask }) {
    const activeTask = useMemo(
        () => tasks.find((t) => t.id === activeTaskId) || tasks[0],
        [ tasks, activeTaskId ],
    );

    const taskDisplayNumbers = useMemo(() => {
        let numberedCount = 0;
        return tasks.map((task) => {
            const name = task.title || task.name || '';
            const isNumbered = name.startsWith('Nhiệm vụ');
            if (isNumbered) {
                numberedCount += 1;
                return numberedCount;
            }
            return null;
        });
    }, [ tasks ]);

    if (!tasks.length) return null;

    return (
        <div className={styles.panel}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                {tasks.map((task, index) => (
                    <TaskSidebarItem
                        key={task.id}
                        task={task}
                        isActive={task.id === activeTask?.id}
                        onClick={() => onSelectTask?.(task.id)}
                        num={taskDisplayNumbers[index]}
                    />
                ))}
            </aside>

            {/* DETAIL */}
            <div className={styles.detail}>
                {activeTask ? (
                    <>
                        {/* Header */}
                        <div className={styles.detailHeader}>
                            <h1 className={styles.detailTitle}>{activeTask.title || activeTask.name}</h1>
                            {activeTask.description && (
                                <p className={styles.detailDescription}>{activeTask.description}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <hr className={styles.detailDivider} />

                        {/* Content */}
                        <div className={styles.detailContent}>
                            <ContentRenderer content={activeTask.content} />
                        </div>
                    </>
                ) : (
                    <div className={styles.noTask}>Chọn một nhiệm vụ để xem nội dung.</div>
                )}
            </div>
        </div>
    );
}

export default TaskPanel;
