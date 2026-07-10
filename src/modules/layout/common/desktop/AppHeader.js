import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import { removeCacheToken, removeCacheUserEmail, removeCacheUserKind } from '@services/userService';
import { accountActions } from '@store/actions';
import { getDownloadUrl } from '@utils';

import NotificationDropdown from './NotificationDropdown';

import styles from './AppHeader.module.scss';

const AppHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, profile } = useAuth();
    const [ dropdownOpen, setDropdownOpen ] = useState(false);
    const { execute: executeLogoutApi } = useFetch(apiConfig.account.logout);

    const isActive = (path) => (location.pathname === path ? styles.active : '');

    const handleLogout = () => {
        setDropdownOpen(false);
        removeCacheToken();
        removeCacheUserKind();
        removeCacheUserEmail();
        dispatch(accountActions.logout());
        executeLogoutApi({
            onCompleted: () => {},
            onError: () => {},
        });
        navigate('/login');
    };

    const handleProfileClick = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    const handleNavClick = (path) => (e) => {
        e.preventDefault();
        navigate(path);
        setDropdownOpen(false);
    };

    return (
        <div className={styles.appHeader} id="">
            <nav className={styles['lp-nav']}>
                <div
                    className={styles['lp-nav__logo']}
                    onClick={() => {
                        navigate('/');
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    💡 ITDream
                </div>

                <div className={styles['lp-nav__links']}>
                    {isAuthenticated ? (
                        <>
                            <a
                                href="/dashboard"
                                className={isActive('/dashboard')}
                                onClick={handleNavClick('/dashboard')}
                            >
                                Bảng điều khiển
                            </a>
                            <a
                                href="/simulations"
                                className={isActive('/simulations')}
                                onClick={handleNavClick('/simulations')}
                            >
                                Các bài mô phỏng
                            </a>
                            <a href="/blog" className={isActive('/blog')} onClick={handleNavClick('/blog')}>
                                Blog
                            </a>
                            <a href="/jobs" className={isActive('/jobs')} onClick={handleNavClick('/jobs')}>
                                Tin tuyển dụng
                            </a>
                        </>
                    ) : (
                        <>
                            <a href="#" className={isActive('/simulations')} onClick={handleNavClick('/simulations')}>
                                Các bài mô phỏng
                            </a>
                            <a href="/blog" className={isActive('/blog')} onClick={handleNavClick('/blog')}>
                                Blog
                            </a>
                        </>
                    )}
                </div>

                <div className={styles['lp-nav__actions']}>
                    {isAuthenticated ? (
                        <>
                            <NotificationDropdown />
                            <div style={{ position: 'relative' }}>
                                <button
                                    className={styles.userAvatarTrigger}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    {profile?.avatar || profile?.avatarPath ? (
                                        <img
                                            src={getDownloadUrl(profile.avatar || profile.avatarPath)}
                                            alt={profile?.fullName || 'User'}
                                            className={styles.userAvatarImg}
                                        />
                                    ) : (
                                        <span className={styles.userAvatarInitials}>
                                            {(profile?.fullName || profile?.account?.fullName || 'U')
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </button>
                                {dropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <button className={styles.dropdownItem} onClick={handleProfileClick}>
                                            Hồ sơ cá nhân
                                        </button>
                                        <button className={styles.dropdownItem} onClick={handleLogout}>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className={`${styles['lp-btn']} ${styles['lp-btn--outline']}`}
                                onClick={() => navigate('/register')}
                            >
                                Đăng Ký
                            </button>
                            <button
                                className={`${styles['lp-btn']} ${styles['lp-btn--ghost']}`}
                                onClick={() => navigate('/login')}
                            >
                                Đăng Nhập
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default AppHeader;
