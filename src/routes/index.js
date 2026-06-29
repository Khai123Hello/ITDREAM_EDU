import React from 'react';
import PublicLayout from '@modules/layout/common/PublicLayout';

const PageNotAllowed = React.lazy(() => import('@components/common/page/PageNotAllowed'));
const PageNotFound = React.lazy(() => import('@components/common/page/PageNotFound'));
const BlogListContainer = React.lazy(() => import('@modules/containers/blog'));
const BlogDetailContainer = React.lazy(() => import('@modules/containers/blog/detail'));
const DashBoardPageContainer = React.lazy(() => import('@modules/containers/dashboard'));
const JobsPageContainer = React.lazy(() => import('@modules/containers/jobs'));
const LandingPageContainer = React.lazy(() => import('@modules/containers/landing'));
const LoginPageContainer = React.lazy(() => import('@modules/containers/login'));
const PolicyContainer = React.lazy(() => import('@modules/containers/policy'));
const ProfilePageContainer = React.lazy(() => import('@modules/containers/profile'));
const RegisterContainer = React.lazy(() => import('@modules/containers/register/register'));
const SimulationCompletedContainer = React.lazy(
    () => import('@modules/containers/simulation/SimulationCompletedContainer'),
);
const SimulationDetailContainer = React.lazy(() => import('@modules/containers/simulation/SimulationDetailContainer'));
const SimulationListContainer = React.lazy(() => import('@modules/containers/simulation/SimulationListContainer'));
const TaskDoingContainer = React.lazy(() => import('@modules/containers/simulation/TaskDoingContainer'));

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
    jobsPage: {
        path: '/jobs',
        component: JobsPageContainer,
        auth: true,
        title: 'Việc làm IT',
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
    simulationCompletedPage: {
        path: '/simulations/:id/completed',
        component: SimulationCompletedContainer,
        auth: true,
        title: 'Hoàn thành bài mô phỏng',
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
