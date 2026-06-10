import { apiUrl, apiUrlTenant, AppConstants } from '.';

const baseHeader = {
    'Content-Type': 'application/json',
};

const multipartFormHeader = {
    'Content-Type': 'multipart/form-data',
};

const formUrlEncodedHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
};

const apiConfig = {
    file: {
        upload: {
            baseURL: `${AppConstants.mediaRootUrl}v1/file/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
    },
    account: {
        getToken: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: baseHeader,
        },
        refreshToken: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: formUrlEncodedHeaders,
            ignoreAuth: true,
        },
        getProfileAdmin: {
            baseURL: `${apiUrl}v1/account/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        getProfileStudent: {
            baseURL: `${apiUrl}v1/student/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        getProfileEducator: {
            baseURL: `${apiUrl}v1/educator/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        loginBasic: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: baseHeader,
            ignoreAuth: true,
        },
        loginOAuth: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: formUrlEncodedHeaders,
            ignoreAuth: true,
        },
        login: {
            baseURL: `${apiUrl}v1/account/login`,
            method: 'POST',
            headers: baseHeader,
        },
        logout: {
            baseURL: `${apiUrl}v1/account/logout`,
            method: 'GET',
            headers: baseHeader,
        },
        verifyCredential: {
            baseURL: `${apiUrl}v1/account/verify-credential`,
            method: 'POST',
            headers: baseHeader,
        },
        verifyOtp: {
            baseURL: `${apiUrl}v1/account/verify-otp`,
            method: 'POST',
            headers: baseHeader,
        },
        verify: {
            baseURL: `${apiUrl}v1/account/verify`,
            method: 'POST',
            headers: baseHeader,
        },
        resendVerify: {
            baseURL: `${apiUrl}v1/account/resend_verify`,
            method: 'POST',
            headers: baseHeader,
        },
        getProfile: {
            baseURL: `${apiUrl}v1/account/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        register: {
            baseURL: `${apiUrl}v1/customer/register`,
            method: 'POST',
            headers: baseHeader,
        },
        updateProfile: {
            baseURL: `${apiUrl}v1/account/update_admin`,
            method: 'PUT',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/account/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        requestForgetPassword: {
            baseURL: `${apiUrl}v1/account/request-forget-password`,
            method: 'POST',
            headers: baseHeader,
        },
        forgetPassword: {
            baseURL: `${apiUrl}v1/account/forget-password`,
            method: 'POST',
            headers: baseHeader,
        },
        getList: {
            baseURL: `${apiUrl}v1/account/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ACC_L',
        },
        adminList: {
            baseURL: `${apiUrl}v1/account/list?kind=1`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ACC_L',
        },
        updateAdmin: {
            baseURL: `${apiUrl}v1/account/update_admin`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ACC_U',
        },
        delete: {
            baseURL: `${apiUrl}v1/account/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: 'ACC_D',
        },
        createAdmin: {
            baseURL: `${apiUrl}v1/account/create_admin`,
            method: `POST`,
            headers: baseHeader,
            permissionCode: 'ACC_C',
        },
    },
    simulation: {
        guestList: {
            baseURL: `${apiUrl}v1/simulation/guest_list`,
            method: 'GET',
            headers: baseHeader,
        },
        guestDetail: {
            baseURL: `${apiUrl}v1/simulation/guest_get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        studentList: {
            baseURL: `${apiUrl}v1/simulation/student_list`,
            method: 'GET',
            headers: baseHeader,
        },
        studentGet: {
            baseURL: `${apiUrl}v1/simulation/student_get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    task: {
        guestList: {
            baseURL: `${apiUrl}v1/task/guest_list`,
            method: 'GET',
            headers: baseHeader,
        },
        studentList: {
            baseURL: `${apiUrl}v1/task/student_list`,
            method: 'GET',
            headers: baseHeader,
        },
        studentGet: {
            baseURL: `${apiUrl}v1/task/student_get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    simulationEnrollment: {
        create: {
            baseURL: `${apiUrl}v1/simulation_enrollment/create`,
            method: 'POST',
            headers: baseHeader,
        },
        studentList: {
            baseURL: `${apiUrl}v1/simulation_enrollment/student_list`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    taskProgress: {
        create: {
            baseURL: `${apiUrl}v1/task_progress/create`,
            method: 'POST',
            headers: baseHeader,
        },
        complete: {
            baseURL: `${apiUrl}v1/task_progress/complete`,
            method: 'POST',
            headers: baseHeader,
        },
        reset: {
            baseURL: `${apiUrl}v1/task_progress/reset`,
            method: 'POST',
            headers: baseHeader,
        },
        studentList: {
            baseURL: `${apiUrl}v1/task_progress/student_list`,
            method: 'GET',
            headers: baseHeader,
        },
        studentGet: {
            baseURL: `${apiUrl}v1/task_progress/student_get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    achievement: {
        studentList: {
            baseURL: `${apiUrl}v1/achievement/student_list`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    category: {
        autoComplete: {
            baseURL: `${apiUrl}v1/category/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    blog: {
        studentList: {
            baseURL: `${apiUrl}v1/blog/student-list`,
            method: 'GET',
            headers: baseHeader,
        },
        studentGet: {
            baseURL: `${apiUrl}v1/blog/student-get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    user: {
        register: {
            baseURL: `${apiUrl}v1/user/register`,
            method: 'POST',
            headers: baseHeader,
        },
        getProfile: {
            baseURL: `${apiUrl}v1/user/profile`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: false,
        },
        updateProfile: {
            baseURL: `${apiUrl}v1/user/update-profile`,
            method: 'PUT',
            headers: baseHeader,
            isRequiredTenantId: false,
        },
    },
    groupPermission: {
        getGroupList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: 'GR_L',
        },
        getList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: 'GR_L',
        },
        getPemissionList: {
            baseURL: `${apiUrl}v1/permission/list`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: 'PER_L',
        },
        getPemissionListByApp: {
            baseURL: `${apiUrl}v1/project-role-permission/list-by-app`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: 'PRP_L_A',
        },
        getById: {
            baseURL: `${apiUrl}v1/group/get/:id`,
            method: 'GET',
            headers: baseHeader,
            permissionCode: 'GR_V',
        },
        create: {
            baseURL: `${apiUrl}v1/group/create`,
            method: 'POST',
            headers: baseHeader,
            permissionCode: 'GR_C',
        },
        update: {
            baseURL: `${apiUrl}v1/group/update`,
            method: 'PUT',
            headers: baseHeader,
            permissionCode: 'GR_U',
        },
        delete: {
            baseURL: `${apiUrl}v1/group/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            permissionCode: 'GR_D',
        },
        getGroupListCombobox: {
            baseURL: `${apiUrl}v1/group/list_combobox`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    educator: {
        approve: {
            baseURL: `${apiUrl}v1/educator/approve`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ED_AP',
        },
        autoComplete: {
            baseURL: `${apiUrl}v1/educator/auto-complete`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ED_AP',
        },
        clientUpdate: {
            baseURL: `${apiUrl}v1/educator/client_update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ED_U_U',
        },
        delete: {
            baseURL: `${apiUrl}v1/educator/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: 'ED_D',
        },
        getById: {
            baseURL: `${apiUrl}v1/educator/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ED_V',
        },
        getList: {
            baseURL: `${apiUrl}v1/educator/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ED_L',
        },
        profile: {
            baseURL: `${apiUrl}v1/educator/profile`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ED_U_P',
        },
        reject: {
            baseURL: `${apiUrl}v1/educator/reject`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ED_RJ',
        },
        register: {
            baseURL: `${apiUrl}v1/educator/signup`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/educator/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ED_U',
        },
        otp: {
            baseURL: `${apiUrl}v1/educator/verify`,
            method: `POST`,
            headers: baseHeader,
        },
    },
    student: {
        autoComplete: {
            baseURL: `${apiUrl}v1/student/auto-complete`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ST_AP',
        },
        clientUpdate: {
            baseURL: `${apiUrl}v1/student/client_update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ST_U_U',
        },
        delete: {
            baseURL: `${apiUrl}v1/student/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
            permissionCode: 'ST_D',
        },
        getById: {
            baseURL: `${apiUrl}v1/student/get/:id`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ST_V',
        },
        getList: {
            baseURL: `${apiUrl}v1/student/list`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ST_L',
        },
        profile: {
            baseURL: `${apiUrl}v1/student/profile`,
            method: `GET`,
            headers: baseHeader,
            permissionCode: 'ST_U_P',
        },
        register: {
            baseURL: `${apiUrl}v1/student/signup`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/student/update`,
            method: `PUT`,
            headers: baseHeader,
            permissionCode: 'ST_U',
        },
        otp: {
            baseURL: `${apiUrl}v1/student/verify`,
            method: `POST`,
            headers: baseHeader,
        },
    },
    questionQuizHistory: {
        create: {
            baseURL: `${apiUrl}v1/question_quiz_history/create`,
            method: 'POST',
            headers: baseHeader,
        },
    },
};

export default apiConfig;
