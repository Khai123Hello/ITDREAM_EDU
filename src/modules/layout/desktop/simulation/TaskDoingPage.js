import React, { useState } from 'react';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Spin } from 'antd';

import TaskDoingSidebar from './TaskDoingSidebar';

import './TaskDoingPage.scss';

/**
 * TaskDoingPage
 * Wrapper that reuses TheForagePage template with:
 * - Task hierarchy support (parent tasks + subtasks)
 * - Dynamic sidebar rendering
 * - Dynamic step pagination
 * - Media content rendering (image, video, file)
 * - File upload handling
 *
 * This component bridges the gap between API data and TheForagePage UI
 */

function FileDropzone({ onFileChange = () => {} }) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    const handleChange = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            onFileChange(f);
        }
    };

    return (
        <div className="tfo-upload-card">
            <div className="tfo-upload-label">Nộp Bài Làm Của Bạn</div>
            <label
                className={`tfo-dropzone${dragging ? ' dragging' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <input type="file" style={{ display: 'none' }} onChange={handleChange} />
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

function FooterNav({ onBack = () => {}, onNext = () => {}, canGoBack = true, canGoNext = true }) {
    return (
        <footer className="tfo-footer-nav">
            <div className="tfo-footer-inner">
                <div className="tfo-footer-buttons">
                    <button className="tfo-btn-back" onClick={onBack} disabled={!canGoBack}>
                        Back
                    </button>
                    <button className="tfo-btn-next" onClick={onNext} disabled={!canGoNext}>
                        Next
                    </button>
                </div>
            </div>
        </footer>
    );
}

// Main component
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

    // Progress info
    taskStatus = 'not_started', // 'not_started', 'in_progress', 'completed'
    errorCount = 0,

    // Navigation
    canGoBack = false,
    canGoNext = false,
    onBack = () => {},
    onNext = () => {},
    onFileChange = () => {},
    onStartTask = () => {},
    onCompleteTask = () => {},
    onResetTask = () => {},
}) {
    // Helper to render media
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
        } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
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

    // Error state
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

    // Loading state
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

    // Calculate progress
    const activeSubtaskIndex = subtasks.findIndex((s) => s.id === selectedSubtaskId);
    const progressPercentage =
        subtasks.length > 0 && selectedSubtaskId ? ((activeSubtaskIndex + 1) / subtasks.length) * 100 : 0;

    // Khi chọn parent task, cập nhật ID parent task được chọn
    const handleSelectParentTask = (taskId) => {
        onSelectParentTask(taskId);
    };

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
                                onSelectParentTask={handleSelectParentTask}
                            />

                            {/* Right pane with layout columns */}
                            <main className="tfo-pane">
                                <div className="tfo-pane-layout" style={{ width: '100%' }}>
                                    {/* Left pane column (Content) */}
                                    <div className="tfo-pane-left" style={{ width: '100%' }}>
                                        <div className="tfo-pane-topbar">
                                            <div className="tfo-pane-title">{pageTitle}</div>
                                            {subtasks && subtasks.length > 0 && (
                                                <div className="tfo-step-pagination">
                                                    {subtasks.map((st, index) => {
                                                        const isActive = st.id === selectedSubtaskId;
                                                        return (
                                                            <button
                                                                key={st.id}
                                                                className={`tfo-step-btn${isActive ? ' active' : ''}`}
                                                                onClick={() => onSelectSubtask(st.id)}
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
                                            <div className="tfo-task-heading">{taskHeading}</div>

                                            <div className="tfo-task-body">
                                                {taskDescriptionContent && (
                                                    <p className="tfo-body-text" style={{ whiteSpace: 'pre-line' }}>
                                                        {taskDescriptionContent}
                                                    </p>
                                                )}

                                                {taskBody && (
                                                    <p className="tfo-body-text" style={{ whiteSpace: 'pre-line' }}>
                                                        {taskBody}
                                                    </p>
                                                )}

                                                {renderMedia()}

                                                {/* Task status and action buttons */}
                                                <div className="tfo-task-actions">
                                                    {taskStatus === 'not_started' && (
                                                        <button
                                                            className="tfo-action-btn tfo-action-btn-primary"
                                                            onClick={onStartTask}
                                                        >
                                                            Bắt đầu Nhiệm vụ
                                                        </button>
                                                    )}

                                                    {taskStatus === 'in_progress' && (
                                                        <>
                                                            <button
                                                                className="tfo-action-btn tfo-action-btn-primary"
                                                                onClick={onCompleteTask}
                                                            >
                                                                Hoàn thành Nhiệm vụ
                                                            </button>
                                                            {errorCount > 0 && (
                                                                <div className="tfo-action-info">Lỗi: {errorCount}</div>
                                                            )}
                                                        </>
                                                    )}

                                                    {taskStatus === 'completed' && (
                                                        <>
                                                            <div className="tfo-action-completed">
                                                                ✓ Nhiệm vụ đã Hoàn thành
                                                            </div>
                                                            <button
                                                                className="tfo-action-btn tfo-action-btn-secondary"
                                                                onClick={onResetTask}
                                                            >
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
