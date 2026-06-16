import React, { useState } from 'react';
import { IoNotificationsOffOutline, IoNotificationsOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import DropdownMenu from '@components/common/elements/DropdownMenu';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';

import styles from './NotificationDropdown.module.scss';

function NotificationDropdown() {
    const [ open, setOpen ] = useState(false);

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
        if (!item.readFlag && !loadingUpdate) {
            try {
                await updateRead({
                    data: { id: item.id },
                });
                fetchNotifications();
            } catch (error) {
                toast.error('Không thể cập nhật trạng thái thông báo');
            }
        }
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
                open={open}
                onOpenChange={setOpen}
                trigger={
                    <button className={styles.bellButton} aria-label="Notifications">
                        <IoNotificationsOutline />
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </button>
                }
            >
                <div className={styles.dropdownContent}>
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
                </div>
            </DropdownMenu>
        </div>
    );
}

export default NotificationDropdown;
