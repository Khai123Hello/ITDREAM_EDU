import React, { useState } from 'react';
import {
    IoBusinessOutline,
    IoDocumentTextOutline,
    IoNotificationsOffOutline,
    IoNotificationsOutline,
    IoPersonOutline,
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import DropdownMenu from '@components/common/elements/DropdownMenu';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';

import styles from './NotificationDropdown.module.scss';

function NotificationDropdown() {
    const [ open, setOpen ] = useState(false);
    const [ expandedId, setExpandedId ] = useState(null);
    const [ details, setDetails ] = useState({});

    const {
        data: notificationsData,
        execute: fetchNotifications,
        loading: loadingList,
    } = useFetch(apiConfig.notification.studentList, {
        immediate: true,
        params: { page: 0, size: 20 },
        mappingData: (res) => res || {},
    });

    const { execute: updateRead, loading: loadingUpdate } = useFetch(apiConfig.notification.updateReadFlag);
    const { execute: clearAllRead, loading: loadingClear } = useFetch(apiConfig.notification.clearAll);

    const notificationsList = notificationsData?.data?.content || [];
    const unreadCount = notificationsList.filter((item) => !item.readFlag).length;
    const hasReadNotifications = notificationsList.some((item) => item.readFlag);

    const handleNotificationClick = async (item) => {
        if (expandedId === item.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(item.id);

        if (!details[item.id] || !item.readFlag) {
            try {
                const response = await updateRead({
                    data: { id: item.id },
                });

                if (response && response.result && response.data) {
                    setDetails((prev) => ({ ...prev, [item.id]: response.data }));
                    if (!item.readFlag) {
                        fetchNotifications();
                    }
                }
            } catch (error) {
                toast.error('Không thể lấy chi tiết thông báo');
            }
        }
    };

    const renderDetailMessage = (message) => {
        if (!message) return null;
        const lines = message.split('\n');
        return (
            <div className={styles.inlineDetail}>
                {lines.map((line, idx) => {
                    const cleanLine = line.trim();
                    if (!cleanLine) return null;

                    let icon = null;
                    let text = cleanLine.replace(/^\?+\s*/, '');

                    if (cleanLine.includes('Bài mô phỏng')) {
                        icon = <IoDocumentTextOutline className={styles.detailIcon} />;
                    } else if (cleanLine.includes('Người đánh giá')) {
                        icon = <IoPersonOutline className={styles.detailIcon} />;
                    } else if (cleanLine.includes('Tổ chức')) {
                        icon = <IoBusinessOutline className={styles.detailIcon} />;
                    }

                    return (
                        <div key={idx} className={styles.detailRow}>
                            {icon}
                            <span className={icon ? styles.detailText : styles.detailTextRegular}>{text}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleClearAll = async (e) => {
        e.stopPropagation();
        if (hasReadNotifications && !loadingClear) {
            try {
                await clearAllRead();
                toast.success('Đã xóa tất cả thông báo đã đọc');
                fetchNotifications();
            } catch (error) {
                toast.error('Không thể xóa thông báo');
            }
        }
    };

    return (
        <div className={styles.notificationWrapper}>
            <DropdownMenu
                align="end"
                side="bottom"
                sideOffset={2}
                open={open}
                onOpenChange={setOpen}
                className={styles.dropdownContent}
                trigger={
                    <button className={styles.bellButton} aria-label="Notifications">
                        <IoNotificationsOutline />
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </button>
                }
            >
                <DropdownMenu.Arrow className={styles.dropdownArrow} width={32} height={16} />
                <div className={styles.header}>
                    <h3>Thông báo</h3>
                    <button
                        className={styles.clearButton}
                        onClick={handleClearAll}
                        disabled={!hasReadNotifications || loadingClear}
                    >
                        Xóa hết đã đọc
                    </button>
                </div>

                <div className={styles.listContainer}>
                    {loadingList && notificationsList.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : notificationsList.length > 0 ? (
                        notificationsList.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.notificationItem} ${!item.readFlag ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className={styles.contentWrapper}>
                                    <span className={styles.title}>{item.title}</span>
                                    {expandedId === item.id && details[item.id] && (
                                        <>
                                            <span className={styles.dateInline}>{details[item.id].createdDate}</span>
                                            {renderDetailMessage(details[item.id].message)}
                                        </>
                                    )}
                                </div>
                                {!item.readFlag && <span className={styles.dot} />}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <IoNotificationsOffOutline />
                            <p>Không có thông báo nào</p>
                        </div>
                    )}
                </div>
            </DropdownMenu>
        </div>
    );
}

export default NotificationDropdown;
