import React, { useState } from 'react';

export default function TaskDoingSidebar({
    taskNumber = 1,
    taskLabel = 'Nhiệm vụ',
    taskDescription = '',
    companyLogo = null,
    parentTasks = [],
    selectedParentTaskId = null,
    onSelectParentTask = () => {},
}) {
    const [achievementsExpanded, setAchievementsExpanded] = useState(true);

    return (
        <aside className="tfo-sidebar">
            {/* Logo area */}
            <div className="tfo-sidebar-logo-area">
                {companyLogo ? (
                    <img src={companyLogo} alt="Company logo" className="tfo-sidebar-logo-img" />
                ) : (
                    <div className="tfo-sidebar-logo-skyscanner">
                        <span className="tfo-logo-blue">Skyscanner</span>
                    </div>
                )}
            </div>

            {/* Parent tasks list with timeline */}
            <div className="tfo-task-list">
                {parentTasks.map((task, idx) => {
                    const isActive = selectedParentTaskId === task.id;
                    const isLast = idx === parentTasks.length - 1;

                    return (
                        <div key={task.id || idx} className="tfo-task-list-row">
                            {/* Timeline column */}
                            <div className="tfo-task-timeline">
                                <button
                                    className={`tfo-task-circle${isActive ? ' active' : ''}`}
                                    onClick={() => onSelectParentTask(task.id)}
                                    aria-label={`Task ${idx + 1}`}
                                >
                                    {idx + 1}
                                </button>
                                {!isLast && <div className="tfo-task-connector" />}
                            </div>

                            {/* Content column */}
                            <button
                                className={`tfo-task-content-btn${isActive ? ' active' : ''}`}
                                onClick={() => onSelectParentTask(task.id)}
                            >
                                <div className={`tfo-task-title${isActive ? ' active' : ''}`}>
                                    {task.title || task.name}
                                </div>
                                {task.description && <div className="tfo-task-short-desc">{task.description}</div>}
                                <div className="tfo-task-meta">
                                    <span className="tfo-task-difficulty">
                                        <span className="dots">•••</span> {task.difficulty || 'Easy'}
                                    </span>
                                    <span className="tfo-task-time">
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            className="tfo-task-time-icon"
                                        >
                                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                                            <path
                                                d="M7 4v3.5l2 1.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {task.estimatedTime || '1-2 hours'}
                                    </span>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Achievements section */}
            {selectedParentTaskId && (
                <div className="tfo-achievements">
                    <div
                        className="tfo-achievements-header"
                        onClick={() => setAchievementsExpanded(!achievementsExpanded)}
                    >
                        <span className="tfo-achievements-title">Achievements</span>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className={`tfo-achievements-chevron${achievementsExpanded ? ' expanded' : ''}`}
                        >
                            <path
                                d="M4 6l4 4 4-4"
                                stroke="#3e3e3e"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div className={`tfo-achievements-body-wrap${achievementsExpanded ? ' expanded' : ''}`}>
                        <div className="tfo-achievements-body">
                            <span className="tfo-achievements-hint">Why this is important</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                                <circle cx="8" cy="8" r="7" stroke="#888" strokeWidth="1.2" />
                                <path d="M8 7v4" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
                                <circle cx="8" cy="5" r="0.7" fill="#888" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
