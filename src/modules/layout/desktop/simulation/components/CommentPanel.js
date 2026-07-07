import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCornerDownRight, FiEdit2, FiSend, FiTrash2, FiX } from 'react-icons/fi';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/vi';

// Enable relativeTime for dayjs and set Vietnamese locale
dayjs.extend(relativeTime);
dayjs.locale('vi');

// Helper to generate initials from full name
const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Helper to parse date string (DD/MM/YYYY HH:mm:ss or ISO)
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split(' ');
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';
        const [day, month, year] = datePart.split('/');
        return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    return new Date(dateStr);
};

// Helper to generate consistent gradient background based on initials/username hash
const getAvatarColor = (name) => {
    const colors = [
        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', // violet/purple
        'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // pink/rose
        'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', // blue
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // amber/orange
        'linear-gradient(135deg, #10b981 0%, #059669 100%)', // emerald/green
        'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // cyan
    ];
    let hash = 0;
    const cleanName = name || '';
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function CommentPanel({
    taskId,
    comments = [],
    loading = false,
    profile = {},
    onClose = () => {},
    onSendComment = () => {},
    onUpdateComment = () => {},
    onDeleteComment = () => {},
}) {
    const [mainText, setMainText] = useState('');
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const listEndRef = useRef(null);

    // Filter root comments and replies
    const rootComments = useMemo(() => {
        return comments.filter((c) => !c.parentId || c.parentId === 0);
    }, [comments]);

    const repliesMap = useMemo(() => {
        const map = {};
        const childComments = comments.filter((c) => c.parentId && c.parentId !== 0);

        // Group replies by finding their root parent recursively
        childComments.forEach((reply) => {
            let rootId = reply.parentId;
            let parent = comments.find((c) => c.id === rootId);

            // Traverse up to find the root comment
            while (parent && parent.parentId && parent.parentId !== 0) {
                rootId = parent.parentId;
                parent = comments.find((c) => c.id === rootId);
            }

            if (!map[rootId]) {
                map[rootId] = [];
            }
            map[rootId].push(reply);
        });

        // Sort each replies array by createdDate ascending
        Object.keys(map).forEach((rootId) => {
            map[rootId].sort((a, b) => parseDate(a.createdDate) - parseDate(b.createdDate));
        });

        return map;
    }, [comments]);

    // Handle submit main comment
    const handleMainSubmit = (e) => {
        e.preventDefault();
        if (!mainText.trim()) return;
        onSendComment(mainText.trim(), null);
        setMainText('');
    };

    // Handle submit reply
    const handleReplySubmit = (e, parentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onSendComment(replyText.trim(), parentId);
        setReplyText('');
        setReplyingToId(null);
    };

    // Handle submit edit
    const handleEditSubmit = (e, commentId) => {
        e.preventDefault();
        if (!editText.trim()) return;
        onUpdateComment(commentId, editText.trim());
        setEditingId(null);
        setEditText('');
    };

    // Reset editor states when task changes (Sửa BUG-17)
    useEffect(() => {
        setMainText('');
        setReplyingToId(null);
        setReplyText('');
        setEditingId(null);
        setEditText('');
    }, [taskId]);

    // Scroll to bottom when comments count changes
    useEffect(() => {
        if (listEndRef.current) {
            listEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments.length]);

    // Render Avatar
    const renderAvatar = (user) => {
        const fullName = user?.fullName || user?.username || 'Học viên';
        const initials = getInitials(fullName);
        const bg = getAvatarColor(fullName);

        if (user?.avatar && user.avatar.startsWith('http')) {
            return <img src={user.avatar} alt={fullName} className="tfo-comment-avatar" />;
        }

        return (
            <div className="tfo-comment-avatar-initials" style={{ background: bg }}>
                {initials}
            </div>
        );
    };

    const currentUsername = profile?.username || '';

    // Helper to get kind badge style and label based on user.kind
    const getUserKindBadge = (kind) => {
        switch (Number(kind)) {
            case 1: // Admin
                return {
                    label: 'Quản trị viên',
                    bgColor: '#fee2e2', // light red
                    color: '#991b1b',
                };
            case 2: // Educator
                return {
                    label: 'Giảng viên',
                    bgColor: '#dbeafe', // light blue
                    color: '#1e40af',
                };
            case 4: // Company
                return {
                    label: 'Doanh nghiệp',
                    bgColor: '#fef3c7', // light yellow
                    color: '#92400e',
                };
            case 3: // Student
                return {
                    label: 'Học viên',
                    bgColor: '#f0fdf4', // light green
                    color: '#166534',
                };
            default:
                return null;
        }
    };

    // Render individual comment card (either root or reply)
    const renderCommentCard = (comment, isReply = false) => {
        const isSelf = comment.user?.username === currentUsername;
        const isEditing = editingId === comment.id;
        const isReplying = replyingToId === comment.id;
        const isTeacher = comment.user?.kind !== 3; // Educator, Admin, or Company is Teacher
        const badge = getUserKindBadge(comment.user?.kind);

        let cardClass = `tfo-comment-card`;
        if (isReply) cardClass += ' reply';
        if (isTeacher) cardClass += ' teacher-comment';

        return (
            <div key={comment.id} className={cardClass}>
                <div className="tfo-comment-card-header">
                    {renderAvatar(comment.user)}
                    <div className="tfo-comment-user-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="tfo-comment-fullname">
                                {comment.user?.fullName || comment.user?.username || 'Học viên'}
                            </span>
                            {badge && (
                                <span
                                    className="tfo-comment-badge"
                                    style={{
                                        backgroundColor: badge.bgColor,
                                        color: badge.color,
                                    }}
                                >
                                    {badge.label}
                                </span>
                            )}
                        </div>
                        <span className="tfo-comment-time">{dayjs(parseDate(comment.createdDate)).fromNow()}</span>
                    </div>
                    {isSelf && !isEditing && (
                        <div className="tfo-comment-actions" style={{ display: 'flex', gap: 4 }}>
                            <button
                                className="tfo-comment-edit-btn"
                                onClick={() => {
                                    setEditingId(comment.id);
                                    setEditText(comment.content);
                                    setReplyingToId(null);
                                }}
                                title="Sửa bình luận"
                            >
                                <FiEdit2 size={12} />
                            </button>
                            <button
                                className="tfo-comment-delete-btn"
                                onClick={() => onDeleteComment(comment.id)}
                                title="Xóa bình luận"
                            >
                                <FiTrash2 size={12} style={{ color: '#ff4d4f' }} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="tfo-comment-card-body">
                    {isEditing ? (
                        <form onSubmit={(e) => handleEditSubmit(e, comment.id)} className="tfo-comment-edit-form">
                            <textarea
                                className="tfo-comment-input-textarea"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.ctrlKey && e.key === 'Enter') {
                                        handleEditSubmit(e, comment.id);
                                    }
                                }}
                                rows={2}
                                autoFocus
                            />
                            <div className="tfo-comment-input-actions">
                                <button
                                    type="button"
                                    className="tfo-comment-btn-text"
                                    onClick={() => setEditingId(null)}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="tfo-comment-btn-filled" disabled={!editText.trim()}>
                                    Lưu
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="tfo-comment-text">
                            {comment.replyToUser && (
                                <span className="tfo-comment-mention">@{comment.replyToUser} </span>
                            )}
                            {comment.content}
                        </p>
                    )}
                </div>

                {!isEditing && (
                    <div className="tfo-comment-card-footer">
                        <button
                            className="tfo-comment-action-link"
                            onClick={() => {
                                setReplyingToId(comment.id);
                                setReplyText('');
                                setEditingId(null);
                            }}
                        >
                            Trả lời
                        </button>
                    </div>
                )}

                {isReplying && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="tfo-comment-reply-form">
                        <textarea
                            className="tfo-comment-input-textarea"
                            placeholder={`Trả lời ${comment.user?.fullName || 'học viên'}... (Ctrl + Enter để gửi)`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'Enter') {
                                    handleReplySubmit(e, comment.id);
                                }
                            }}
                            rows={2}
                            autoFocus
                        />
                        <div className="tfo-comment-input-actions">
                            <button
                                type="button"
                                className="tfo-comment-btn-text"
                                onClick={() => setReplyingToId(null)}
                            >
                                Hủy
                            </button>
                            <button type="submit" className="tfo-comment-btn-filled" disabled={!replyText.trim()}>
                                Gửi
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    return (
        <div className="tfo-comments-panel">
            {/* Panel Header */}
            <div className="tfo-comments-panel-header">
                <h3 className="tfo-comments-panel-title">Thảo luận nhiệm vụ ({comments.length})</h3>
                <button className="tfo-comments-close-btn" onClick={onClose} title="Đóng bình luận">
                    <FiX size={20} />
                </button>
            </div>

            {/* Comments List */}
            <div className="tfo-comments-list-container">
                {loading && comments.length === 0 ? (
                    <div className="tfo-comments-loading">
                        <Spin size="medium" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="tfo-comments-empty">
                        <p>Chưa có bình luận nào. Hãy bắt đầu cuộc thảo luận!</p>
                    </div>
                ) : (
                    <div className="tfo-comments-scrollable">
                        {rootComments.map((root) => {
                            const threadReplies = repliesMap[root.id] || [];
                            return (
                                <div key={root.id} className="tfo-comment-thread">
                                    {renderCommentCard(root, false)}
                                    {threadReplies.length > 0 && (
                                        <div className="tfo-comment-thread-replies">
                                            <div className="tfo-comment-thread-line" />
                                            <div className="tfo-comment-replies-list">
                                                {threadReplies.map((reply) => (
                                                    <div key={reply.id} className="tfo-comment-reply-item">
                                                        <FiCornerDownRight className="tfo-comment-reply-arrow" />
                                                        {renderCommentCard(reply, true)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={listEndRef} />
                    </div>
                )}
            </div>

            {/* Compose Form at the bottom (Horizontal layout) */}
            <form onSubmit={handleMainSubmit} className="tfo-comments-panel-footer">
                <textarea
                    className="tfo-comments-main-textarea"
                    placeholder="Viết bình luận... (Ctrl + Enter để gửi)"
                    value={mainText}
                    onChange={(e) => setMainText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                            handleMainSubmit(e);
                        }
                    }}
                    rows={1}
                />
                <button
                    type="submit"
                    className="tfo-comments-send-btn"
                    disabled={!mainText.trim()}
                    title="Gửi bình luận"
                >
                    <FiSend size={16} />
                </button>
            </form>
        </div>
    );
}
