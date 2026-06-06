import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Avatar from '@assets/icons/avatar.svg';
import { ReactComponent as Logout } from '@assets/icons/logout.svg';
import { ReactComponent as Order } from '@assets/icons/order.svg';
import { ReactComponent as Password } from '@assets/icons/password.svg';
import { ReactComponent as User } from '@assets/icons/user.svg';
import { ReactComponent as Wallet } from '@assets/icons/wallet.svg';
import { useConfirmModal } from '@components/common/elements/ConfirmModalWrapper';
import Divider from '@components/common/elements/Divider';
import DropdownMenu from '@components/common/elements/DropdownMenu';
import Flex from '@components/common/elements/Flex';
import { AppConstants } from '@constants';
import useAuth from '@hooks/useAuth';
import { removeCacheToken } from '@services/userService';
import { accountActions } from '@store/actions';

import styles from './AppHeader.module.scss';

function UserInfo() {
    const { profile: user } = useAuth();
    const dispatch = useDispatch();
    const { confirm } = useConfirmModal();
    const onLogout = () => {
        confirm({
            title: 'Logout',
            content: 'Are you sure you want to log out?',
            onConfirm: () => {
                removeCacheToken();
                dispatch(accountActions.logout());
            },
        });
    };

    const navigation = useNavigate();

    return (
    // <Tooltip
    //     align="center"
    //     side="bottom"
    //     trigger={
    //         <div className={styles.userInfo}>
    //             <div className={styles.avatar}>
    //                 <img alt="avatar" src={user?.avatar ? AppConstants.contentRootUrl + user?.avatar : avatar} />
    //             </div>
    //         </div>
    //     }
    // >

    // </Tooltip>

        <DropdownMenu
            align="end"
            side="bottom"
            className={styles.popoverContent}
            trigger={
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <img alt="avatar" src={user?.avatar ? AppConstants.contentRootUrl + user?.avatar : Avatar} />
                    </div>
                </div>
            }
        >
            <div className={styles.contentProfile}>
                <div className={styles.contentProfile}>
                    <Flex direction="column">
                        <div className={styles.item} onClick={() => navigation('/profile')}>
                            <Flex gap="12px" align="center">
                                <div>
                                    <img
                                        alt="avatar"
                                        className={styles.avatar}
                                        src={user?.avatar ? AppConstants.contentRootUrl + user?.avatar : Avatar}
                                    />
                                </div>
                                <Flex direction="column" gap="8px">
                                    <div className={styles.fullName}>{user?.fullName}</div>
                                    <div className={styles.email}>{user?.email}</div>
                                </Flex>
                            </Flex>
                        </div>
                        <Divider margin="4px 0px" />
                        <div className={styles.item} onClick={() => navigation('/profile')}>
                            {/* <User /> */}
                            <span>Hồ sơ</span>
                        </div>
                        <Divider margin="4px 0px" />
                        <div className={styles.item} onClick={() => navigation('/change-password-profile')}>
                            {/* <Wallet style={{ width: '20px', height: '20px', margin: '0px 4px' }} /> */}
                            <span>Ví của tôi</span>
                        </div>
                        <Divider margin="4px 0px" />
                        <Divider margin="4px 0px" />
                        <div className={styles.item} onClick={() => navigation('/order-history')}>
                            <span>Đơn hàng của tôi</span>
                        </div>
                        <Divider margin="4px 0px" />
                        <Divider margin="4px 0px" />
                        <div className={styles.item} onClick={() => navigation('/change-password-profile')}>
                            {/* <Password style={{ width: '20px', height: '20px', margin: '0px 4px' }} /> */}
                            <span>Đổi mật khẩu</span>
                        </div>
                        <Divider margin="4px 0px" />
                        <div onClick={onLogout} className={styles.item} style={{ color: '#E85848' }}>
                            {/* <Logout style={{ stroke: 'red' }} /> */}
                            <span>Đăng xuất</span>
                        </div>
                    </Flex>
                </div>
            </div>
        </DropdownMenu>
    );
}

export default UserInfo;
