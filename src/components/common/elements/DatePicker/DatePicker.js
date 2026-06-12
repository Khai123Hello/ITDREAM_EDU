import React from 'react';
import { ReactComponent as IconClear } from '@assets/icons/clear-icon.svg';
import { ReactComponent as ScheduleIcon } from '@assets/icons/schedule.svg';
import classNames from 'classnames';
import Picker from 'rc-picker';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import viVN from 'rc-picker/lib/locale/vi_VN';

import 'rc-picker/assets/index.css';
import styles from './DatePicker.module.scss';

const DatePicker = ({
    id,
    className,
    dropdownClassName,
    date,
    showTime,
    picker = undefined,
    showToday = false,
    allowClear = false,
    locale = viVN,
    onChange,
    inputReadOnly = true,
    getPopupContainer,
    suffixIcon,
    value,
    format,
    label,
    error,
    disabledDate,
    required,
    ...props
}) => {
    const onSelect = () => {
        // console.log("Select:", newValue);
    };
    const pickerDate = ['time', 'date', 'month', 'year', 'timeShort', 'week'].includes(picker) ? picker : undefined;

    const renderPickers = (picker) => {
        if (!picker) return 'date';
        return {
            time: 'time',
            timeShort: 'time',
            date: 'date',
            month: 'month',
            year: 'year',
            week: 'week',
        };
    };

    const pickerConfig = pickerDate ? renderPickers(pickerDate)[pickerDate] : undefined;
    const pickerValue = value ?? date;
    const localeObject = {
        ...locale,
        shortMonths: [
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12',
        ],
        shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    };
    const sharedProps = {
        ...props,
        generateConfig: dayjsGenerateConfig,
        value: date,
        onChange,
        onSelect,
    };
    pickerDate && (sharedProps.picker = pickerDate);
    pickerDate === undefined && (sharedProps.showTime = true);

    return (
        <div>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <Picker
                {...sharedProps}
                disabledDate={disabledDate}
                locale={localeObject}
                format={format}
                picker={pickerConfig}
                showTime={showTime}
                className={classNames(styles.boxTimer, className, {
                    [styles.inputDefault]: true,
                    [styles.inputShowMonth]: pickerDate === 'month',
                    [styles.inputShowDateOrTime]: ['date', 'time'].includes(pickerDate),
                    [styles.inputShowDateTime]: !pickerDate,
                    [styles.error]: error,
                })}
                suffixIcon={suffixIcon ? suffixIcon : <ScheduleIcon />}
                dropdownClassName={classNames(styles.dropdownPicker, dropdownClassName)}
                superPrevIcon={<span className={classNames(styles.superIcon, styles.superPrevIcon)}></span>}
                superNextIcon={<span className={classNames(styles.superIcon, styles.superNextIcon)}></span>}
                prevIcon={<span className={classNames(styles.icon, styles.prevIcon)}></span>}
                nextIcon={<span className={classNames(styles.icon, styles.nextIcon)}></span>}
                showToday={showToday}
                showNow
                value={pickerValue}
                allowClear={allowClear ? { clearIcon: <IconClear /> } : allowClear}
                inputReadOnly={inputReadOnly}
                getPopupContainer={getPopupContainer ?? ((trigger) => trigger.parentElement || document.body)}
            />
        </div>
    );
};

export default DatePicker;
