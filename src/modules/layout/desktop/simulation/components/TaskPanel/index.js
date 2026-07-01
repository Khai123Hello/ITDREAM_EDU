import React, { useMemo, useState } from 'react';
import TipTapJsonRenderer from '@components/common/editor/TipTapJsonRenderer';
import { FileTextOutlined } from '@ant-design/icons';

import styles from './TaskPanel.module.scss';

/**
 * TaskPanel nhận flat list tasks gồm cả kind=1 (task cha) và kind=2 (subtask).
 *
 * Logic:
 * - Sidebar chỉ hiển thị task cha (kind=1), sắp xếp theo orderInParent
 * - Khi click task cha → tự động chọn subtask đầu tiên (orderInParent nhỏ nhất) thuộc task đó
 * - Pagination số ở góc trên phải = danh sách subtask của task cha đang chọn
 * - Nội dung bên phải = nội dung subtask đang active
 */
function TaskPanel({
    tasks = [],
    activeTaskId,
    onSelectTask,
    quizSubmissionMap,
    questionMap,
    onQuizAnswerSubmit,
    hasCompleted,
    onQuestionRendered,
}) {
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
                            {!activeSubTask.description && !activeSubTask.content && (
                                <div className={styles.emptyBodyPlaceholder}>
                                    <FileTextOutlined className={styles.emptyBodyIcon} />
                                </div>
                            )}
                            <TipTapJsonRenderer
                                content={activeSubTask.content}
                                quizSubmissionMap={quizSubmissionMap}
                                questionMap={questionMap}
                                onQuizAnswerSubmit={onQuizAnswerSubmit}
                                hasCompleted={hasCompleted}
                                onQuestionRendered={onQuestionRendered}
                            />
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
                                {!parent.description && !parent.content && (
                                    <div className={styles.emptyBodyPlaceholder}>
                                        <FileTextOutlined className={styles.emptyBodyIcon} />
                                    </div>
                                )}
                                <TipTapJsonRenderer
                                    content={parent.content}
                                    quizSubmissionMap={quizSubmissionMap}
                                    questionMap={questionMap}
                                    onQuizAnswerSubmit={onQuizAnswerSubmit}
                                    hasCompleted={hasCompleted}
                                    onQuestionRendered={onQuestionRendered}
                                />
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
