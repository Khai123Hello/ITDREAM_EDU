import React, { useMemo, useState } from 'react';

import styles from './TaskPanel.module.scss';

// ─────────────────────────────────────────
// Helpers: detect content type
// ─────────────────────────────────────────
function detectContentType(content) {
    if (!content || typeof content !== 'string') return 'empty';
    const trimmed = content.trim();
    if (trimmed.startsWith('[')) {
        try {
            const p = JSON.parse(trimmed);
            if (Array.isArray(p)) return 'blocks';
        } catch (e) {
            // ignore
        }
    }
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
// Renderer: markdown
// ─────────────────────────────────────────
function parseInline(text) {
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
                                    {(block.bullets || []).filter(Boolean).map((b, i) => (
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
// Main component
// ─────────────────────────────────────────
/**
 * TaskPanel nhận flat list tasks gồm cả kind=1 (task cha) và kind=2 (subtask).
 *
 * Logic:
 * - Sidebar chỉ hiển thị task cha (kind=1), sắp xếp theo orderInParent
 * - Khi click task cha → tự động chọn subtask đầu tiên (orderInParent nhỏ nhất) thuộc task đó
 * - Pagination số ở góc trên phải = danh sách subtask của task cha đang chọn
 * - Nội dung bên phải = nội dung subtask đang active
 */
function TaskPanel({ tasks = [], activeTaskId, onSelectTask }) {
    // Tách task cha (kind=1) và subtask (kind=2)
    const parentTasks = useMemo(
        () => tasks.filter((t) => t.kind === 1).sort((a, b) => (a.orderInParent ?? 0) - (b.orderInParent ?? 0)),
        [ tasks ],
    );

    // Map parentId → subtasks[], sắp xếp theo orderInParent
    const subTaskMap = useMemo(() => {
        const map = {};
        tasks
            .filter((t) => t.kind === 2)
            .forEach((t) => {
                const pid = t.parent?.id;
                if (pid == null) return;
                if (!map[pid]) map[pid] = [];
                map[pid].push(t);
            });
        // sort each group
        Object.keys(map).forEach((pid) => {
            map[pid].sort((a, b) => (a.orderInParent ?? 0) - (b.orderInParent ?? 0));
        });
        return map;
    }, [ tasks ]);

    // Task cha đang active — dùng activeTaskId từ prop (trỏ đến kind=1)
    // hoặc fallback về task cha đầu tiên
    const [ activeParentId, setActiveParentId ] = useState(() => activeTaskId ?? parentTasks[0]?.id ?? null);

    // Subtask đang active (kind=2)
    const [ activeSubId, setActiveSubId ] = useState(() => {
        const firstParent = activeTaskId ?? parentTasks[0]?.id;
        if (firstParent == null) return null;
        const subs = subTaskMap[firstParent] ?? [];
        return subs[0]?.id ?? null;
    });

    // Khi prop activeTaskId thay đổi từ bên ngoài (kind=1) → sync
    React.useEffect(() => {
        if (activeTaskId == null) return;
        const task = tasks.find((t) => t.id === activeTaskId);
        if (!task) return;

        if (task.kind === 1) {
            setActiveParentId(task.id);
            const subs = subTaskMap[task.id] ?? [];
            setActiveSubId(subs[0]?.id ?? null);
        } else if (task.kind === 2) {
            const pid = task.parent?.id;
            if (pid != null) setActiveParentId(pid);
            setActiveSubId(task.id);
        }
    }, [ activeTaskId ]); // eslint-disable-line react-hooks/exhaustive-deps

    // Subtasks của task cha đang chọn
    const currentSubTasks = useMemo(
        () => (activeParentId != null ? (subTaskMap[activeParentId] ?? []) : []),
        [ activeParentId, subTaskMap ],
    );

    // Subtask đang hiển thị
    const activeSubTask = useMemo(
        () => currentSubTasks.find((s) => s.id === activeSubId) ?? currentSubTasks[0] ?? null,
        [ currentSubTasks, activeSubId ],
    );

    // Click task cha trong sidebar
    const handleSelectParent = (parentId) => {
        setActiveParentId(parentId);
        const subs = subTaskMap[parentId] ?? [];
        const firstSub = subs[0] ?? null;
        setActiveSubId(firstSub?.id ?? null);
        // Báo lên ngoài (truyền id của subtask đầu tiên, hoặc id task cha nếu không có sub)
        onSelectTask?.(firstSub?.id ?? parentId);
    };

    // Click số pagination (subtask)
    const handleSelectSub = (subId) => {
        setActiveSubId(subId);
        onSelectTask?.(subId);
    };

    if (!parentTasks.length) return null;

    return (
        <div className={styles.panel}>
            {/* ── SIDEBAR (task cha) ── */}
            <aside className={styles.sidebar}>
                {parentTasks.map((task, index) => {
                    const isActive = task.id === activeParentId;
                    const isLast = index === parentTasks.length - 1;
                    return (
                        <div key={task.id} className={styles.sidebarRow}>
                            {/* Timeline column */}
                            <div className={styles.sidebarTimeline}>
                                <button
                                    className={`${styles.sidebarCircle} ${isActive ? styles.sidebarCircleActive : ''}`}
                                    onClick={() => handleSelectParent(task.id)}
                                    aria-label={`Task ${index + 1}`}
                                >
                                    {index + 1}
                                </button>
                                {!isLast && <div className={styles.sidebarConnector} />}
                            </div>

                            {/* Content column */}
                            <button
                                className={`${styles.sidebarContentBtn} ${isActive ? styles.sidebarContentBtnActive : ''}`}
                                onClick={() => handleSelectParent(task.id)}
                            >
                                <span className={`${styles.sidebarTitle} ${isActive ? styles.sidebarTitleActive : ''}`}>
                                    {task.title || task.name}
                                </span>
                                {task.description && (
                                    <span className={styles.sidebarDesc}>
                                        {task.description.length > 60
                                            ? `${task.description.slice(0, 60)}…`
                                            : task.description}
                                    </span>
                                )}
                                {task.estimatedTime && (
                                    <span className={styles.sidebarTime}>
                                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="6" stroke="#888" strokeWidth="1.2" />
                                            <path
                                                d="M7 4v3.5l2 1.5"
                                                stroke="#888"
                                                strokeWidth="1.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {task.estimatedTime}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </aside>

            {/* ── DETAIL (subtask) ── */}
            <div className={styles.detail}>
                {activeSubTask ? (
                    <>
                        {/* Topbar: tên task cha + pagination subtasks */}
                        <div className={styles.detailTopbar}>
                            <span className={styles.detailTopbarLabel}>
                                {parentTasks.find((p) => p.id === activeParentId)?.title ||
                                    parentTasks.find((p) => p.id === activeParentId)?.name ||
                                    ''}
                            </span>

                            {currentSubTasks.length > 1 && (
                                <div className={styles.subtaskPagination}>
                                    {currentSubTasks.map((sub, i) => {
                                        const isActiveSub = sub.id === activeSubTask.id;
                                        return (
                                            <button
                                                key={sub.id}
                                                className={`${styles.subtaskPageBtn} ${isActiveSub ? styles.subtaskPageBtnActive : ''}`}
                                                onClick={() => handleSelectSub(sub.id)}
                                                aria-label={`Step ${i + 1}`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <hr className={styles.detailDivider} />

                        {/* Subtask content */}
                        <div className={styles.detailContent}>
                            <h1 className={styles.detailTitle}>{activeSubTask.title || activeSubTask.name}</h1>
                            {activeSubTask.description && (
                                <p className={styles.detailDescription}>{activeSubTask.description}</p>
                            )}
                            <ContentRenderer content={activeSubTask.content} />
                        </div>
                    </>
                ) : (
                    /* Task cha không có subtask — hiển thị nội dung task cha */
                    (() => {
                        const parent = parentTasks.find((p) => p.id === activeParentId);
                        return parent ? (
                            <div className={styles.detailContent}>
                                <h1 className={styles.detailTitle}>{parent.title || parent.name}</h1>
                                {parent.description && <p className={styles.detailDescription}>{parent.description}</p>}
                                <ContentRenderer content={parent.content} />
                            </div>
                        ) : (
                            <div className={styles.noTask}>Chọn một nhiệm vụ để xem nội dung.</div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}

export default TaskPanel;
