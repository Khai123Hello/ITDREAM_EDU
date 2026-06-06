import React from 'react';

export default function TaskDoingSidebar({
    taskNumber = 1,
    taskLabel = 'Nhiệm vụ',
    taskDescription = '',
    companyLogo = null,
    parentTasks = [],
    selectedParentTaskId = null,
    onSelectParentTask = () => {},
}) {
    return (
        <aside className="tfo-sidebar">
            <div className="tfo-sidebar-logo-area">
                {companyLogo ? (
                    <img src={companyLogo} alt="Company logo" className="tfo-sidebar-logo-img" />
                ) : (
                    <span className="tfo-sidebar-logo-fallback">Org</span>
                )}
            </div>

            {/* Parent tasks list */}
            <div className="tfo-task-list">
                {parentTasks.map((task, idx) => (
                    <button
                        key={task.id}
                        className={`tfo-task-list-item${selectedParentTaskId === task.id ? ' active' : ''}`}
                        onClick={() => onSelectParentTask(task.id)}
                    >
                        {idx + 1}. {task.title || task.name}
                    </button>
                ))}
            </div>

            {/* Selected task card */}
            {selectedParentTaskId && (
                <>
                    <div className="tfo-task-card">
                        <div className="tfo-task-number-badge">
                            <span>{taskNumber}</span>
                        </div>
                        <div className="tfo-task-card-body">
                            <div className="tfo-task-label">{taskLabel}</div>
                            {taskDescription && <div className="tfo-task-desc">{taskDescription}</div>}
                        </div>
                    </div>

                    <div className="tfo-achievements">
                        <div className="tfo-achievements-header">
                            <span className="tfo-achievements-title">Tiến độ</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M4 6l4 4 4-4"
                                    stroke="#3e3e3e"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="tfo-achievements-body">
                            <span className="tfo-achievements-hint">Hãy tiếp tục cố gắng!</span>
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
}
