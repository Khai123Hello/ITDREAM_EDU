import {
    apiUrl,
    AppConstants,
    CurrentcyPositions,
    DATE_FORMAT_DISPLAY,
    DATE_SHORT_MONTH_FORMAT,
    DATE_YEAR_FORMAT,
    DATE_YEAR_FORMAT_TIME,
    DEFAULT_FORMAT,
    DEFAULT_LANGUAGE_ID,
    DEFAULT_TABLE_ITEM_SIZE,
    KEYS,
    LESSON_KIND_SECTION,
    THEMES,
} from '@constants';
import store from '@store';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import { isValidJson } from 'itz-react-library/dist/utils';
import { isArray, isObject } from 'lodash';
import qs from 'query-string';

import { getObjectData } from './localStorage';
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
export const convertGlobImportToObject = (modules) =>
    modules
        .filter((module) => !!module.default)
        .reduce(
            (rs, cur) => ({
                ...rs,
                [cur.default.name]: cur.default,
            }),
            {},
        );

export const convertGlobImportToArray = (modules) =>
    modules.filter((module) => !!module.default).map((module) => module.default);

export const destructCamelCaseString = (string) => {
    const arrString = [ ...string ];
    const newArrString = [];
    arrString.forEach((char, index) => {
        if (char.charCodeAt(0) > 90) {
            newArrString.push(char);
        } else {
            index && newArrString.push('-');
            newArrString.push(char.toLowerCase());
        }
    });
    return newArrString.join('');
};

export const getBrowserTheme = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDark ? THEMES.DARK : THEMES.LIGHT;
};

export const makeURL = (baseURL, params, pathParams) => {
    for (let key of Object.keys(pathParams || {})) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    if (params) {
        baseURL = baseURL + '?' + qs.stringify(params);
    }

    return baseURL;
};

export const parseURL = (url) => {
    try {
        return new URL(url);
    } catch (error) {
        return '';
    }
};

export const getYTEmbedLinkFromYTWatchLink = (watchLink) => {
    if (!watchLink) {
        return '';
    }

    const { v } = qs.parse(parseURL(watchLink).search);
    return v ? `https://www.youtube.com/embed/${v}?autoplay=1&mute=1` : watchLink;
};

export const getYoutubeVideoID = (url) => {
    let pattern = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
    return pattern.exec(url)?.[3];
};

export const formatNumber = (value) => {
    if (value) {
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            return `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalVal}`;
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (value === 0) return 0;
    return '';
};

export const formatDateString = (dateString, formatDate = DATE_SHORT_MONTH_FORMAT) => {
    return dayjs(dateString).format(formatDate);
};

export const removeAccents = (str) => {
    if (str)
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    return str;
};

export const validateUsernameForm = (rule, username) => {
    return /^[a-z0-9_]+$/.exec(username)
        ? Promise.resolve()
        : Promise.reject('Username chỉ bao gồm các ký tự a-z, 0-9, _');
};

export const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

export const delay = (ms) => new Promise((reslove) => setTimeout(reslove, ms));

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const filterLanguage = (data, languageId = DEFAULT_LANGUAGE_ID, size = 1) => {
    let mappedArray = [];
    for (var i = 0; i < size; i++) {
        let returnItem = {};
        if (data[i]) {
            if (data[i].info)
                data[i].info.map((lang) => {
                    if (lang.languageId === languageId) returnItem = lang;
                });
            mappedArray.push(returnItem);
        } else break;
    }
    return mappedArray;
};

export const relativePosition = (element, target) => {
    if (!element || !target) return;

    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = elementRect.top - targetRect.top;
    const left = elementRect.left - targetRect.left;
    return { top, left };
};

export const convertUtcToLocalTime = (utcTime, format = DATE_FORMAT_DISPLAY) => {
    try {
        if (utcTime) return dayjs.utc(utcTime).format(format);
    } catch (error) {
        return '';
    }
};

export const formatCurrency = (local, style, currencyType) => {
    let currency = new Intl.NumberFormat(local, {
        style: style,
        currency: currencyType,
    });
    return currency;
};

export const formatMoney = (value, setting = {}) => {
    if (Object.keys(setting) <= 0) setting = getObjectData(KEYS.USER_DATA)?.settings?.['Money and Number'] || {};
    if ((value || value === 0) && !isNaN(value)) {
        const groupSeparator = setting.groupSeparator || ',';
        const decimalSeparator = setting.decimalSeparator || '.';
        const currentcy = setting.currencySymbol || '';
        const currencySymbolPosition = setting.currencySymbolPosition;
        const moneyRatio = setting.moneyRatio || 1;
        const decimal = Number(setting.decimal) || 0;
        if (value.toString().indexOf(decimalSeparator) === -1) {
            value = value / moneyRatio;
            value = value.toFixed(decimal);
            const decimalIndex = value.toString().lastIndexOf('.');
            if (decimalIndex > -1) {
                value =
                    value.toString().substring(0, decimalIndex) +
                    decimalSeparator +
                    value.toString().substring(decimalIndex + 1);
            }
        } else {
            value = value.toFixed(Number(setting.decimal) || 0);
        }
        value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
        if (currencySymbolPosition === CurrentcyPositions.FRONT) {
            return `${currentcy} ${value}`;
        } else {
            return `${value} ${currentcy}`;
        }
    }
    return '';
};

export const formatCurrencyValue = (value, setting = {}) => {
    if ((value || value === 0) && !isNaN(value)) {
        const state = store.getState()?.restaurant?.dataRestaurant?.setting?.general;
        setting = state || {};
        const groupSeparator = setting?.group_separator || ',';
        const decimalSeparator = setting?.decimal_separator || '.';
        const decimalSpace = setting?.decimal_space || 2;
        const currentcy = setting?.currency || '$';
        const currencySymbolPosition = setting?.currency_position;
        const moneyRatio = setting?.moneyRatio || 1;
        const euroValue = value / 100;
        const [ integerPart, decimalPart = '' ] = euroValue.toFixed(decimalSpace).split('.');
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
        const formattedNumber = decimalPart
            ? `${formattedIntegerPart}${decimalSeparator}${decimalPart}`
            : formattedIntegerPart;

        if (!currentcy) return formattedNumber;

        return currencySymbolPosition === CurrentcyPositions.BACK
            ? `${formattedNumber} ${currentcy}`
            : `${currentcy} ${formattedNumber}`;
    }
    return '';
};

export const convertStringToLowerCase = (str) => {
    if (str) {
        return str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x) => x.toLowerCase())
            .join(' ');
    }
    return '';
};

/**
 * Valid input is an Array
 * @param {Any} arr
 * @return {Array}
 */
export const ensureArray = (arr, defaultValue) =>
    Array.isArray(arr) ? arr : Array.isArray(defaultValue) ? defaultValue : [];

export function cleanObject(obj = {}, { clear = [ undefined ], recursive = true } = {}) {
    return Object.entries(obj).reduce((acc, [ key, value ]) => {
        if (recursive && isObject(value) && !isArray(value)) {
            acc[key] = cleanObject(value, { clear });
        } else if (!clear.includes(value) || (isArray(value) && value.length > 0)) {
            acc[key] = value;
        }

        return acc;
    }, {});
}

export function formatLesson(data) {
    const sections = [];
    let currentParent = null;

    data?.forEach((item) => {
        if (item.kind === LESSON_KIND_SECTION) {
            sections.push({
                ...item,
                lessons: [],
                totalStudyTime: 0,
                totalLesson: 0,
            });
            currentParent = sections[sections.length - 1];
        } else if (currentParent) {
            currentParent.lessons.push(item);
            currentParent.totalStudyTime += item.videoDuration || 0;
            currentParent.totalLesson++;
        }
    });
    return sections;
}

export const price = (value) => {
    return formatMoney(value, {
        groupSeparator: ',',
        currencySymbol: 'đ',
        currentcyPosition: 'BACK',
        currentDecimal: '0',
    });
};

export const removePathParams = (paths) => {
    return ensureArray(paths).map((path) => {
        if (typeof path !== 'string') return path;
        return path.replaceAll(/\/:[a-zA-Z]+/g, '');
    });
};
export const validatePermission = (
    requiredPermissions = [],
    userPermissions = [],
    requiredKind,
    userKind,
    excludeKind = [],
    profile,
    path,
    separate,
) => {
    if (ensureArray(excludeKind).length > 0) {
        if (ensureArray(excludeKind).some((kind) => kind == userKind)) return false;
    }
    if (requiredKind) {
        if (requiredKind !== userKind) return false;
    }
    if (!requiredPermissions || requiredPermissions?.length == 0) return true;
    if (userPermissions.some((code) => requiredPermissions.includes(code))) {
        return true;
    }
    let permissionsSavePage = [];
    if (separate && requiredPermissions.length > 0) {
        permissionsSavePage.push(path?.type === 'create' ? requiredPermissions[0] : requiredPermissions[1]);
    } else {
        permissionsSavePage = requiredPermissions;
    }
    return removePathParams(permissionsSavePage).every((item) => userPermissions?.includes(item?.replace(apiUrl, '/')));
};

export function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate);
        currentDate = currentDate.add(1, 'days');
    }
    return dateArray.map((item) => dayjs(item).format(DATE_YEAR_FORMAT));
}

export function getTotalDuration(array) {
    return array.reduce((total, item) => {
        try {
            const durationObj = JSON.parse(item.schedule);
            return total + (durationObj.duration || 0);
        } catch (error) {
            return total; // Bỏ qua nếu JSON không hợp lệ
        }
    }, 0);
}

export function getTotalPrice(array) {
    return array.reduce(
        (total, item) =>
            total +
            (item.fullPriceAmount ??
                item.calculatedPriceAmount ??
                item.fullPriceAmountOffline ??
                item.calculatedPriceAmountOffline ??
                0),
        0,
    );
}

export const getMinMax = (items) => {
    if (!items || items.length === 0) return { min: 0, max: 0 };
    const prices = items
        .map(
            (item) =>
                item.fullPriceAmount ??
                item.calculatedPriceAmount ??
                item.fullPriceAmountOffline ??
                item.calculatedPriceAmountOffline,
        )
        .filter((price) => typeof price === 'number');

    if (prices.length === 0) return { min: 0, max: 0 };
    return {
        min: Math.min(...prices) || 0,
        max: Math.max(...prices) || 0,
    };
};

export function getCurrentTimePeriod() {
    const state = store.getState()?.restaurant?.dataRestaurant?.setting?.general;
    const now = new Date();
    const hours = now.getHours();
    const dayOfWeek = now.getDay(); // 0: Chủ nhật, 1: Thứ Hai, ..., 6: Thứ Bảy

    // Xác định buổi trong ngày
    let timePeriod;
    if (hours >= 1 && hours < 12) {
        timePeriod = 'sáng';
    } else if (hours >= 12 && hours < 18) {
        timePeriod = 'chiều';
    } else {
        timePeriod = 'tối';
    }

    // Xác định thứ trong tuần
    const weekdays = [ 'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy' ];
    const currentDay = weekdays[dayOfWeek];

    return { timePeriod, currentDay };
}

export const getValueDiscount = (discountOption) => {
    const discountOptionValue = isValidJson(discountOption) && JSON.parse(discountOption)?.timeLineDiscount;
    const timeOfDay = store.getState()?.restaurant?.dataRestaurant?.setting?.timeOfDay;

    if (!discountOptionValue || !timeOfDay) {
        return 0;
    }

    const today = dayjs();
    const weekName = today.format('d');

    const arrayDiscountOption = Object.entries(discountOptionValue)?.map(([ key, value ]) => ({
        time: key,
        dataDiscount: value,
    }));
    const arrayTimeOfDay = Object.entries(timeOfDay)?.map(([ key, value ]) => ({
        timeOfDay: key,
        ...value,
    }));
    if (arrayTimeOfDay?.length == 0) {
        return 0;
    }
    const timeOfDayObject = arrayTimeOfDay?.find((item) => {
        const start = dayjs(item?.start, 'HH:mm');
        const end = dayjs(item?.end, 'HH:mm');
        return today.isBetween(start, end, []);
    });

    const timePeriod = timeOfDayObject?.timeOfDay;
    if (!timePeriod) {
        return;
    }

    const result = arrayDiscountOption.find((item) => item?.time == timePeriod);
    const data = result?.dataDiscount?.find((i, index) => index == weekName - 1);

    return data?.discount || 0;
};

export function getMinMaxDuration(array) {
    const durations = array
        .map((item) => {
            try {
                const durationObj = JSON.parse(item.schedule);
                return durationObj.duration || 0;
            } catch (error) {
                return null; // Nếu JSON không hợp lệ, bỏ qua
            }
        })
        .filter((value) => value !== null); // Lọc bỏ các giá trị null

    if (durations.length === 0) {
        return { min: 0, max: 0 };
    }

    return {
        min: Math.min(...durations),
        max: Math.max(...durations),
    };
}

export function generateTimeSlots(selectedDate, interval = 15) {
    const times = [];
    let start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0); // Đặt giờ bắt đầu từ 00:00 của ngày được chọn

    const now = new Date(); // Lấy thời gian hiện tại

    while (start.getDate() === new Date(selectedDate).getDate()) {
        let hours = start.getHours();
        let minutes = start.getMinutes();
        let period = hours >= 12 ? 'PM' : 'AM';

        // Format label (12 giờ AM/PM)
        let formattedHours = hours % 12 || 12;
        let formattedMinutes = minutes.toString().padStart(2, '0');
        let label = `${formattedHours}:${formattedMinutes}`;

        // Format value theo "dd/MM/yyyy HH:mm:ss"
        let day = start.getDate().toString().padStart(2, '0');
        let month = (start.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        let year = start.getFullYear();
        let value = `${day}/${month}/${year} ${hours.toString().padStart(2, '0')}:${formattedMinutes}:00`;

        // Xác định disabled nếu thời gian nhỏ hơn hiện tại
        let disabled = start < now;
        if (!disabled) times.push({ value, label, period });

        start.setMinutes(start.getMinutes() + interval); // Tăng thêm `interval` phút
    }

    return times;
}

export const getOpenTime = (setting) => {
    const dayNumber = dayjs().day() > 0 ? dayjs().day() - 1 : 6;
    const getHourDefault = (time) => {
        return dayjs().hour(time).minute(0).second(0).format('HH:mm');
    };
    const openTime =
        setting?.openTime?.length > 0 ? setting?.openTime?.find((_, index) => index === dayNumber).time : null;
    return {
        open: openTime ? openTime?.[0].from : getHourDefault(8),
        close: openTime ? openTime?.[1].to : getHourDefault(22),
    };
};

export const getOpenTimeDate = (setting, selectedDate) => {
    const dayNumber = dayjs(selectedDate).day() > 0 ? dayjs(selectedDate).day() - 1 : 6;
    const getHourDefault = (time) => {
        return dayjs().hour(time).minute(0).second(0).format('HH:mm');
    };
    const openTime =
        setting?.openTime?.length > 0 ? setting?.openTime?.find((_, index) => index === dayNumber)?.time : null;
    return {
        open: openTime ? openTime?.[0]?.from : getHourDefault(8),
        close: openTime ? openTime?.[1]?.to : getHourDefault(22),
    };
};

export function generateTimeSlotsInDay(selectedDate, setting, interval = 15) {
    const now = dayjs(); // Lấy thời gian hiện tại
    const date = dayjs(selectedDate).format(DATE_YEAR_FORMAT);
    const timeOpen = getOpenTimeDate(setting, selectedDate);
    let start = dayjs(selectedDate).startOf('date');
    let end = dayjs(selectedDate).endOf('date');
    const timeArray = [];
    while (start.isBefore(end) || start.isSame(end)) {
        let checkInOpenTime = start.isBetween(
            dayjs(`${date} ${timeOpen.open}`, DATE_YEAR_FORMAT_TIME),
            dayjs(`${date} ${timeOpen.close}`, DATE_YEAR_FORMAT_TIME),
            [],
        );
        let disabled = start < now;

        if (!disabled && checkInOpenTime)
            timeArray.push({
                value: start.format(DATE_YEAR_FORMAT_TIME),
                label: start.format('HH:mm'),
                period: start.format('A'),
            });
        start = start.add(interval, 'minute');
    }

    return timeArray;
}

export const convertLocalTimeToUtc = (localTime, inputFormat = DEFAULT_FORMAT, format = DEFAULT_FORMAT) => {
    if (!localTime) return '';
    return dayjs(localTime, inputFormat).utc().format(format);
};

export function getComboSkusName(skus) {
    try {
        const skusName = skus?.subSkus
            ?.filter?.((sku) => !sku?.isInherited)
            .map((sku) => {
                return JSON.parse(renderServiceName(sku)).default;
            });

        return skusName.length > 0 ? skusName.join(', ') : '';
    } catch (error) {
        return '';
    }
}

export function renderServiceName(service) {
    const name = JSON.parse(service?.name)?.default;
    if (service.pricingLevel) return JSON.stringify({ default: name + ' (' + service.pricingLevel.name + ')' });
    return service.name;
}

export const disableBrowserBack = () => {
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', function (event) {
        window.history.pushState(null, document.title, window.location.href);
    });
};

export function formatTime(input, translate, message) {
    if (input < 60) {
        return ''.concat(input, ' ').concat(translate.formatMessage(message.minUtil));
    }
    var hours = Math.floor(input / 60);
    var minutes = input % 60;
    if (hours < 24) {
        return minutes === 0
            ? ''.concat(hours).concat(translate.formatMessage(message.hourUtil))
            : ''
                .concat(hours, translate.formatMessage(message.hourUtil))
                .concat(minutes, translate.formatMessage(message.minUtil));
    } else {
        var days = Math.floor(hours / 24);
        var daysHours = hours % 24;
        return daysHours === 0
            ? ''.concat(days, 'd')
            : minutes === 0
                ? ''.concat(days, 'd ').concat(daysHours, translate.formatMessage(message.hourUtil))
                : ''
                    .concat(days, 'd ')
                    .concat(daysHours, translate.formatMessage(message.hourUtil))
                    .concat(minutes, translate.formatMessage(message.minUtil));
    }
}

export const calculateIndex = (index, pagination, queryFilter) => {
    const currentPage = queryFilter?.page || pagination?.current || 1;
    const pageSize = pagination?.pageSize || DEFAULT_TABLE_ITEM_SIZE;
    return index + 1 + (currentPage - 1) * pageSize;
};

const getNestedValue = (obj, path) =>
    path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj);

export const getColumnWidth = (params = {}) => {
    const { data = [], dataIndex = '', width = 100, ratio = 10 } = params;

    if (!Array.isArray(data) || data.length === 0 || !dataIndex) return width;

    const lengths = data
        .map((item) => {
            const value = getNestedValue(item, dataIndex);
            return value !== undefined && value !== null ? String(value).length : 0;
        })
        .filter((len) => len > 0);

    const maxLength = lengths.length > 0 ? Math.max(...lengths) : 0;

    return Math.max(width, maxLength * ratio);
};

export const getDownloadUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    let cleanPath = filePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    const rootUrl = AppConstants.contentRootUrl || '';
    const separator = rootUrl.endsWith('/') ? '' : '/';
    return `${rootUrl}${separator}${cleanPath}`;
};

export const getPreviewUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    let cleanPath = filePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    const rootUrl = (AppConstants.contentRootUrl || '').replace('v1/file/download', 'v1/file/preview');
    const separator = rootUrl.endsWith('/') ? '' : '/';
    return `${rootUrl}${separator}${cleanPath}`;
};
