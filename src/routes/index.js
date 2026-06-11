import React from 'react';
import PageNotAllowed from '@components/common/page/PageNotAllowed';
import PageNotFound from '@components/common/page/PageNotFound';
import BlogListContainer from '@modules/containers/blog';
import BlogDetailContainer from '@modules/containers/blog/detail';
import DashBoardPageContainer from '@modules/containers/dashboard';
import LandingPageContainer from '@modules/containers/landing';
import LoginPageContainer from '@modules/containers/login';
import PolicyContainer from '@modules/containers/policy';
import ProfilePageContainer from '@modules/containers/profile';
import RegisterContainer from '@modules/containers/register/register';
import SimulationDetailContainer from '@modules/containers/simulation/SimulationDetailContainer';
import SimulationListContainer from '@modules/containers/simulation/SimulationListContainer';
import TaskDoingContainer from '@modules/containers/simulation/TaskDoingContainer';
import PublicLayout from '@modules/layout/common/PublicLayout';

/*
	auth
		+ null: access login and not login
		+ true: access login only
		+ false: access not login only
*/
const routes = {
    pageNotAllowed: {
        path: '/not-allowed',
        component: PageNotAllowed,
        auth: null,
        title: 'Trang không được phép truy cập',
    },
    homePage: {
        path: '/',
        component: LandingPageContainer,
        auth: null,
        title: 'Trang chủ',
    },
    dashboardPage: {
        path: '/dashboard',
        component: DashBoardPageContainer,
        auth: true,
        title: 'Bảng điều khiển',
    },
    blogPage: {
        path: '/blog',
        component: BlogListContainer,
        auth: null,
        title: 'Blog',
    },
    blogDetailPage: {
        path: '/blog/:id',
        component: BlogDetailContainer,
        auth: null,
        title: 'Chi tiết Blog',
    },
    loginPage: {
        path: '/login',
        component: LoginPageContainer,
        auth: false,
        title: 'Đăng nhập',
        layout: 'public',
    },
    policyPage: {
        path: '/policy',
        component: PolicyContainer,
        auth: null,
        title: 'Chính sách bảo mật',
        layout: 'public',
    },
    registerPage: {
        path: '/register',
        component: RegisterContainer,
        auth: false,
        title: 'Đăng ký',
        layout: 'public',
    },
    profilePage: {
        path: '/profile',
        component: ProfilePageContainer,
        auth: true,
        title: 'Hồ sơ cá nhân',
        componentProps: {
            title: 'Hồ sơ',
        },
    },
    simulationListPage: {
        path: '/simulations',
        component: SimulationListContainer,
        auth: null,
        title: 'Các bài mô phỏng',
    },
    simulationDetailPage: {
        path: '/simulations/:id',
        component: SimulationDetailContainer,
        auth: null,
        title: 'Chi tiết bài mô phỏng',
    },
    taskDoingPage: {
        path: '/simulations/:id/task',
        component: TaskDoingContainer,
        auth: true,
        title: 'Nhiệm vụ',
    },
    pageNotFound: {
        path: '/page-not-found',
        component: PageNotFound,
        auth: false,
        title: 'Trang không tìm thấy',
    },
    notFound: {
        component: PageNotFound,
        auth: null,
        title: 'Trang không tìm thấy',
        path: '*',
        layout: PublicLayout,
    },
};

export default routes;
