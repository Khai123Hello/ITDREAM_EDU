export const apiUrl = process.env.REACT_APP_API;
export const apiUrlTenant = process.env.REACT_APP_API_TENANT;
export const version = process.env.REACT_APP_VERSION;
export const enableExposure = process.env.REACT_APP_ENABLE_EXPOSURE === 'true';
export const enableMobile = process.env.REACT_APP_IS_MOBILE === 'true';

export const fixedPath = {
    privacy: `${apiUrl}${process.env.REACT_APP_PRIVACY_PATH}`,
    help: `${apiUrl}${process.env.REACT_APP_HELP_PATH}`,
    aboutUs: `${apiUrl}${process.env.REACT_APP_ABOUT_US_PATH}`,
};

//LTS SHOP

export const brandName = 'nail-fe';

export const appName = 'nail-fe';

export const storageKeys = {
    USER_ACCESS_TOKEN: `${appName}-user-access-token`,
    USER_REFRESH_TOKEN: `${appName}-user-refresh-token`,
    USER_EMAIL: `${appName}-user-email`,
    RESTAURANT_ACTIVE: `${appName}-restaurant-active`,
    X_TENANT: `${appName}-X-tenant`,
    CART: `${appName}-cart`,
    TENANT_HEADER: `X-Tenant`,
    CART_DIRECT: `${appName}-cart-direct`,
    APP_VERSION_RESETED: `${appName}-${version}`,
    USER_KIND: `${appName}-user-kind`,
};

export const AppConstants = {
    apiRootUrl: process.env.REACT_APP_API,
    gameApiRootUrl: process.env.REACT_APP_GAME_API,
    contentRootUrl: `${process.env.REACT_APP_API_MEDIA}v1/file/download`,
    mediaRootUrl: `${process.env.REACT_APP_API_MEDIA}`,
    langKey: 'vi',
};
export const appAccount = {
    APP_USERNAME: process.env.REACT_APP_USERNAME,
    APP_PASSWORD: process.env.REACT_APP_PASSWORD,
};
export const GROUP_KIND_STUDENT = 4;
export const GROUP_KIND_EXPERT = 5;
export const GROUP_KIND_SELLER = 6;

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
};

export const defaultLocale = 'vi';
export const locales = ['en', 'vi'];

export const DATE_DISPLAY_FORMAT = 'DD-MM-YYYY HH:mm';
export const DATE_SHORT_MONTH_FORMAT = 'DD MMM YYYY';
export const TIME_FORMAT_DISPLAY = 'HH:mm';
export const DATE_FORMAT_VALUE = 'DD/MM/YYYY';
export const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY';
export const DEFAULT_FORMAT = 'DD/MM/YYYY HH:mm:ss';
export const DATE_FORMAT_ZERO_TIME = 'DD/MM/YYYY 00:00:00';
export const DATE_FORMAT_END_OF_DAY_TIME = 'DD/MM/YYYY 23:59:59';
export const DEFAULT_EXCEL_DATE = 'DDMMYYHHmmss';
export const DEFAULT_FORMAT_DAY_OFF_LOG = 'DD/MM/YYYY HH:mm:00';
export const DEFAULT_FORMAT_ZERO_SECOND = 'DD/MM/YYYY HH:mm:00';

export const KIND_SERVICE = 1;
export const KIND_SERVICE_COMBO = 0;

export const navigateTypeEnum = {
    PUSH: 'PUSH',
    POP: 'POP',
    REPLACE: 'REPLACE',
};

export const articleTypeEnum = {
    URL: 'url',
    PLAIN: 'plain',
};

export const accessRouteTypeEnum = {
    NOT_LOGIN: false,
    REQUIRE_LOGIN: true,
    BOTH: null,
};

export const UploadFileTypes = {
    AVATAR: 'AVATAR',
    LOGO: 'LOGO',
    DOCUMENT: 'DOCUMENT',
};
export const DATE_YEAR_FORMAT = 'DD/MM/YYYY';
export const DATE_YEAR_FORMAT_TIME = 'DD/MM/YYYY HH:mm';
export const DATE_YEAR = 'MMM DD YYYY';
export const LIMIT_IMAGE_SIZE = 512000;

export const STATUS_PENDING = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_LOCK = -1;
export const STATUS_DELETE = -2;

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_TABLE_ITEM_SIZE = 20;
export const DEFAULT_TABLE_ITEM_MOBILE_SIZE = 10;
export const DEFAULT_TABLE_PAGE_START = 0;
export const DEFAULT_LANGUAGE_ID = '1';
export const LESSON_KIND_TEXT = 1;
export const LESSON_KIND_VIDEO = 2;
export const LESSON_KIND_SECTION = 3;
export const commonStatus = {
    PENDING: 0,
    ACTIVE: 1,
    LOCK: -1,
    DELETE: -2,
};

export const commonStatusColor = {
    [commonStatus.PENDING]: 'warning',
    [commonStatus.ACTIVE]: 'green',
    [commonStatus.LOCK]: 'red',
};

export const CurrentcyPositions = {
    FRONT: 0,
    BACK: 1,
};

export const USER_DATA = 'user-data';
export const LANGUAGE = 'language';

export const KEYS = {
    USER_DATA,
    LANGUAGE,
};

export const shopVariantKey = {
    color: 0,
    size: 1,
};

export const FieldTypes = {
    STRING: 'STRING_TYPE',
    NUMBER: 'NUMBER_TYPE',
    SELECT: 'SELECT',
    AUTOCOMPLETE: 'AUTOCOMPLETE',
    DATE: 'DATE',
    DATE_RANGE: 'DATE_RANGE',
};

export const MONTHLY_PERIOD_STATE_PENDING = 0;
export const MONTHLY_PERIOD_STATE_CALCULATED = 1;
export const MONTHLY_PERIOD_STATE_DONE = 2;
export const MONTHLY_PERIOD_STATE_CANCEL = 3;

export const TRANSACTION_LOG_STATE_PENDING = 1;
export const TRANSACTION_LOG_STATE_APPROVED = 2;
export const TRANSACTION_LOG_STATE_REJECTED = 3;

export const REVENUE_PRICE_INTRODUCE = 1;
export const REVENUE_PRICE_SYSTEM = 2;
export const REVENUE_PRICE_PAID = 3;
export const SALARY_PERIOD_DETAIL_STATE_UNPAID = 0;
export const SALARY_PERIOD_DETAIL_STATE_PAID = 1;

export const ORDER_PAYMENT_METHOD_CASH = 1;
export const ORDER_PAYMENT_METHOD_CARD = 2;

export const ORDER_STATE_WAITING = 0;
export const ORDER_STATE_CONFIRM = 1;
export const ORDER_STATE_DONE = 2;
export const ORDER_STATE_CANCEL = 3;

export const BOOKING_STATE_BOOKING = 1;
export const BOOKING_STATE_WORKING = 2;
export const BOOKING_STATE_DONE = 3;
export const BOOKING_STATE_CANCEL = 4;

export const BOOKING_PAYOUT_STATUS_UNPAID = 0;
export const BOOKING_PAYOUT_STATUS_PROCESSING = 1;
export const BOOKING_PAYOUT_STATUS_PAID = 2;

export const FEMALE = 1;
export const MALE = 0;

export const routesNotRequireSiteInfo = [];
export const defaultSlug = 'default';

export const freeEmployee = -1;

export const SERVICE_RATING_KIND_BOOKING = 1;
export const SERVICE_RATING_KIND_AMBIENCE = 2;
export const SERVICE_RATING_KIND_CLEANLINESS = 3;
export const SERVICE_RATING_KIND_SERVICE = 4;
export const SERVICE_RATING_KIND_REPLY = 5;
export const SERVICE_RATING_KIND_USER_REPLY = 6;

export const BEFORE_TAX = 1;
export const AFTER_TAX = 2;

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';

export const DIRECTORY_GENERAL = 'general';

export const USER_KIND_ADMIN = 1;
export const USER_KIND_EDUCATOR = 2;
export const USER_KIND_STUDENT = 3;
export const USER_KIND_COMPANY = 4;

export const UserTypes = {
    ADMIN: 1,
    EDUCATOR: 2,
    STUDENT: 3,
};

export const TASK_KIND_TASK = 1;
export const TASK_KIND_SUBTASK = 2;
export const TASK_KINDS = [TASK_KIND_TASK, TASK_KIND_SUBTASK];

export const STARS = [1, 2, 3, 4, 5];

export const STATUS_FORGET_PASSWORD = 0;
export const STATUS_VERIFY = 3;
export const STATUS_WAITING_APPROVE = 2;
export const STATUS_REJECT = -2;

export const BLOG_STATUS_WAITING_APPROVE = 0;
export const BLOG_STATUS_ACTIVE = 1;
export const BLOG_STATUS_REJECT = -1;

export const SIMULATION_STATUS_ACTIVE = 1;
export const SIMULATION_STATUS_WAITING_APPROVE = 2;
export const SIMULATION_STATUS_WAITING_APPROVE_DELETE = 3;
export const SIMULATION_STATUS_REJECT = -1;

export const STATE_SIMULATION_PROCESSING = 1;
export const STATE_SIMULATION_DONE = 2;
export const STATE_SIMULATION_FAIL = 3;

export const STATE_TASK_PROCESSING = 1;
export const STATE_TASK_DONE = 2;
export const STATE_TASK_FAIL = 3;

export const KIND_SIMULATION = 1;
export const KIND_TASK = 2;

export const SIMULATION_LEVEL_BEGINNER = 1;
export const SIMULATION_LEVEL_INTERMEDIATE = 2;
export const SIMULATION_LEVEL_ADVANCED = 3;
export const SIMULATION_LEVELS = [SIMULATION_LEVEL_BEGINNER, SIMULATION_LEVEL_INTERMEDIATE, SIMULATION_LEVEL_ADVANCED];

export const TASK_TYPE_CONTENT = 1;
export const TASK_TYPE_QUESTION = 2;
export const TASK_TYPE_ANSWER = 3;
export const TASK_TYPES = [TASK_TYPE_CONTENT, TASK_TYPE_QUESTION, TASK_TYPE_ANSWER];

export const CATEGORY_KIND_SPECIALIZATION = 1;
export const CATEGORY_KIND_BLOG = 2;
export const CATEGORY_KINDS = [CATEGORY_KIND_SPECIALIZATION, CATEGORY_KIND_BLOG];

export const RESTART_ERROR_COUNT = 0;

export const QUESTION_TYPE_FILE = 1;
export const QUESTION_TYPE_TEXT = 2;
export const QUESTION_TYPE_QUIZ = 3;
export const QUESTION_TYPES = [QUESTION_TYPE_FILE, QUESTION_TYPE_TEXT, QUESTION_TYPE_QUIZ];

export const SIMULATION_ENROLLMENT_COMPLETED = 1;
export const SIMULATION_ENROLLMENT_IN_PROGRESS = 2;

export const STUDENT_TASK_PROGRESS_COMPLETED = 1;
export const STUDENT_TASK_PROGRESS_IN_PROGRESS = 2;

export const ORGANIZATION_TYPE_UNIVERSITY = 1;
export const ORGANIZATION_TYPE_COMPANY = 2;
export const ORGANIZATION_TYPES = [ORGANIZATION_TYPE_UNIVERSITY, ORGANIZATION_TYPE_COMPANY];

export const BACKEND_PROCESS_VIDEO_CMD = 'BACKEND_PROCESS_VIDEO';
export const MEDIA_COMPLETED_PROCESS_VIDEO_CMD = 'MEDIA_COMPLETED_PROCESS_VIDEO';
export const BACKEND_POST_NOTIFICATION_CMD = 'BACKEND_POST_NOTIFICATION';

export const MAX_ATTEMPT_FORGET_PWD = 5;
export const MAX_TIME_FORGET_PWD = 5 * 60 * 1000; //5 minutes
export const MAX_ATTEMPT_LOGIN = 5;

export const PASSWORD_PATTERN = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$';
export const EMAIL_PATTERN = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
export const PHONE_PATTERN = '^0\\d{9}$';
export const FILE_PATH_PATTERN = '^(https?:\\/\\/)?([\\w\\-]+\\/?)+\\.[A-Za-z0-9]{2,6}$';
export const VIETNAM_HOTLINE_PATTERN = '^(0(2[0-9]{9}|[3|5|7|8|9][0-9]{8})|(1[8|9]00[0-9]{4,6}))$';

export const NOTIFICATION_TYPE_REVIEW_SUBMISSION = 'REVIEW_SUBMISSION';

export const GROUP_KIND_ADMIN = 1;
export const GROUP_KIND_EDUCATOR = 2;
export const ROLE_SUPPER_ADMIN = 15;
export const ROLE_ADMIN = 16;

export const ERROR_ACCOUNT_EXIST = 'ERROR-ACCOUNT-0001';
export const ERROR_USERNAME_EXISTED = 'ERROR-ACCOUNT-0001';

export const groupPermissionKindsOptions = [
    { label: { id: 'admin', defaultMessage: 'Admin' }, value: GROUP_KIND_ADMIN },
    { label: { id: 'educator', defaultMessage: 'Educator' }, value: GROUP_KIND_EDUCATOR },
    { label: { id: 'student', defaultMessage: 'Student' }, value: GROUP_KIND_STUDENT },
];

export const groupRolesOptions = [
    { label: { id: 'superAdmin', defaultMessage: 'Super Admin' }, value: ROLE_SUPPER_ADMIN },
    { label: { id: 'admin', defaultMessage: 'Admin' }, value: ROLE_ADMIN },
];
