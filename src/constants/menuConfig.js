import React from 'react';
import { FiShield, FiSliders, FiTrendingUp, FiUser, FiUserCheck, FiUsers } from 'react-icons/fi';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as Colection } from '@assets/icons/colection.svg';
import { ReactComponent as Order } from '@assets/icons/order.svg';
import { ReactComponent as Password } from '@assets/icons/password.svg';
import { ReactComponent as Rating } from '@assets/icons/rating.svg';
import { ReactComponent as User } from '@assets/icons/user.svg';

const getNavMenuConfig = (restaurantId) => [
    {
        label: <FormattedMessage defaultMessage="Profile" />,
        key: 'info',
        icon: <User height={30} />,
        children: [],
        link: `/${restaurantId}/profile`,
    },
    {
        label: <FormattedMessage defaultMessage="Change Password" />,
        key: 'change',
        children: [],
        icon: <Password height={30} style={{ marginLeft: '-2px' }} />,
        link: `/${restaurantId}/change-password-profile`,
    },
];

export const cmsMenuConfig = [
    {
        label: <FormattedMessage defaultMessage="Dashboard" />,
        key: 'dashboard',
        icon: <FiTrendingUp size={18} />,
        path: '/cms/dashboard',
    },
    {
        label: <FormattedMessage defaultMessage="Quản lý người dùng" />,
        key: 'quan-ly-nguoi-dung',
        icon: <FiUsers size={18} />,
        permission: 'ACC_L',
        children: [
            {
                label: <FormattedMessage defaultMessage="Quản trị viên" />,
                key: 'admin',
                path: '/cms/admins',
                icon: <FiUser size={16} />,
                permission: 'ACC_L',
            },
            {
                label: <FormattedMessage defaultMessage="Educator" />,
                key: 'educator',
                path: '/cms/educators',
                icon: <FiUserCheck size={16} />,
                permission: 'ED_L',
            },
            {
                label: <FormattedMessage defaultMessage="Student" />,
                key: 'student',
                path: '/cms/students',
                icon: <FiUsers size={16} />,
                permission: 'ST_L',
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Quản lý hệ thống" />,
        key: 'quan-ly-he-thong',
        icon: <FiShield size={18} />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Quyền hạn" />,
                key: 'role',
                path: '/cms/group-permissions',
                icon: <FiSliders size={16} />,
                permission: 'GR_L',
            },
        ],
    },
];

export default getNavMenuConfig;
