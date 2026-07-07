import React from 'react';
import { SIMULATION_LEVEL_MAP } from '@constants';

import styles from '../SimulationDetailDesktop/detail.module.scss';

const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        return value
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const getTaskMetaLevel = (task) => {
    if (task?.level !== undefined && task?.level !== null) {
        return SIMULATION_LEVEL_MAP[task.level] || task.level;
    }
    return task?.difficulty || '';
};

const getTaskDuration = (task) => {
    return task?.duration || task?.estimatedTime || task?.time || '';
};

export default function TaskDetailPanel({
    task = {},
    onStartTask = () => {},
    onEnroll = () => {},
    onLogin = () => {},
    isEnrolled = false,
    isAuthenticated = false,
    enrollmentLoading = false,
}) {
    const title = task?.title || task?.name || 'Nhiệm vụ';
    const subtitle = task?.description || 'Sử dụng nhiệm vụ này để thực hành quy trình dự án.';
    const overviewText = task?.introduction || task?.summary || '';
    const howYouLearn = parseList(task?.learningPoints || task?.whatYouWillLearn || task?.experience || task?.skills);
    const howYouDo = parseList(task?.activities || task?.whatYouWillDo || task?.actionItems || task?.tasks);
    const duration = getTaskDuration(task);
    const level = getTaskMetaLevel(task);

    return (
        <div className={styles.taskPanel}>
            <div className={styles.taskPanelTitle}>{title}</div>
            {(duration || level) && (
                <div className={styles.taskPanelMetaRow}>
                    {duration && <span>{duration}</span>}
                    {duration && level && <span className={styles.taskPanelMetaDot}>·</span>}
                    {level && <span className={styles.taskPanelMetaLevel}>{level}</span>}
                </div>
            )}
            <p className={styles.taskPanelSub}>{subtitle}</p>

            {overviewText && (
                <div className={styles.taskBlock}>
                    <div className={styles.taskBlockLabel}>Tổng quan</div>
                    <p>{overviewText}</p>
                </div>
            )}

            {howYouLearn.length > 0 && (
                <div className={styles.infoCard}>
                    <div className={styles.cardHeading}>
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        Nội dung bạn sẽ học
                    </div>
                    <ul className={styles.cardList}>
                        {howYouLearn.map((item, index) => (
                            <li key={`learn-${index}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {howYouDo.length > 0 && (
                <div className={styles.infoCard}>
                    <div className={styles.cardHeading}>
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                        </svg>
                        Nhiệm vụ bạn sẽ làm
                    </div>
                    <ul className={styles.cardList}>
                        {howYouDo.map((item, index) => (
                            <li key={`do-${index}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={styles.taskPanelActions}>
                {!isAuthenticated ? (
                    <button className={styles.heroCtaBtn} onClick={onLogin}>
                        Đăng nhập để bắt đầu
                    </button>
                ) : !isEnrolled ? (
                    <button className={styles.heroCtaBtn} onClick={onEnroll} disabled={enrollmentLoading}>
                        {enrollmentLoading ? 'Đang xử lý...' : 'Tham gia dự án'}
                    </button>
                ) : (
                    <button className={styles.heroCtaBtn} onClick={onStartTask}>
                        Bắt đầu nhiệm vụ
                    </button>
                )}
            </div>
        </div>
    );
}
