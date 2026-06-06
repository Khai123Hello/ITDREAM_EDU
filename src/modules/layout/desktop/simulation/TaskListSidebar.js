import React from 'react';

import styles from './detail.module.scss';

export default function TaskListSidebar({
    tasks = [],
    activeTaskId = null,
    onSelectTask = () => {},
    getDisplayNumber = null,
}) {
    return (
        <div className={styles.taskNav}>
            {tasks.map((task) => {
                const isActive = activeTaskId === task.id;
                const number = getDisplayNumber ? getDisplayNumber(task) : null;
                return (
                    <div
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        className={`${styles.taskNavItem} ${isActive ? styles.active : ''}`}
                        onClick={() => onSelectTask(task.id)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') onSelectTask(task.id);
                        }}
                    >
                        <div className={`${styles.stepCircle} ${number === null ? styles.flagCircle : ''}`}>
                            {number === null ? (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                    <line x1="4" y1="22" x2="4" y2="15" />
                                </svg>
                            ) : (
                                <span>{number}</span>
                            )}
                        </div>
                        <span className={styles.taskNavLabel} title={task.title || task.name}>
                            {task.title || task.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
