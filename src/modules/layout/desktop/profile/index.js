import React, { useEffect, useRef, useState } from 'react';
import { TbBriefcase, TbCalendar, TbCamera, TbCheck, TbEdit, TbMail, TbPhone, TbUser, TbX } from 'react-icons/tb';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as IconClose } from '@assets/icons/closeModal.svg';
import DatePickerField from '@components/common/elements/DatePicker/DatePickerField';
import { Form } from '@components/common/elements/Form';
import Grid from '@components/common/elements/Grid';
import { InputField } from '@components/common/elements/Input';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { AppConstants, MALE, USER_KIND_STUDENT } from '@constants';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@constants/intl';
import useAuth from '@hooks/useAuth';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';
import { getCacheUserKind } from '@services/userService';
import { Select } from 'antd';
import { toast } from 'sonner';

import styles from './index.module.scss';

const messages = defineMessages({
    profileUser: 'User Information',
    avatarUser: 'Profile Picture',
    fullName: 'Full Name',
    email: 'E-mail Address',
    enterFullName: 'Enter your full name',
    enterEmail: 'Enter your email',
    birthday: 'Date of Birth',
    enterBirthday: 'Enter date of birth',
    address: 'Address',
    enterAddress: 'Enter address',
    phone: 'Phone Number',
    enterPhone: 'Enter phone number',
    profileIdentify: 'Identification Information',
    idNumber: 'ID Number',
    enterIdNumber: 'Enter ID number',
    dateIssue: 'Date of Issue',
    enterDateIssue: 'Enter date of issue',
    placeIssue: 'Place of Issue',
    enterPlaceIssue: 'Enter place of issue',
    gender: 'Gender',
    enterGender: 'Enter gender',
    firstName: 'First Name',
    lastName: 'Last Name',
    enterFirstName: 'Enter first name',
    enterLastName: 'Enter last name',
    profilePage: 'Personal Data',
    shortDescription: 'This should be the name that should appear on all booking information.',
    personalInformation: 'Personal Information',
});
const ProfileComponent = (props) => {
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, groups, branchs, data, executeGetProfile } =
        props;
    const { profile: user } = useAuth();
    const translate = useTranslate();
    const fullName = user?.fullName || user?.account?.fullName || '';
    const email = user?.email || user?.account?.email || '';
    const phone = user?.phone || user?.account?.phone || '';
    const firstName = user?.firstName || user?.account?.firstName || '';
    const lastName = user?.lastName || user?.account?.lastName || '';
    const avatarRaw = user?.avatar || user?.avatarPath || '';
    const organizationName =
        user?.organization?.name || user?.organization?.shortName || user?.account?.organization?.name || '';
    const reviewStatus = user?.isReviewed;
    const genderLabel =
        user?.gender === MALE
            ? translate.formatMessage(commonMessage.male)
            : user?.gender
                ? translate.formatMessage(commonMessage.female)
                : '';
    const navigation = useNavigate();
    const params = useParams();

    const isStudent = getCacheUserKind() === USER_KIND_STUDENT;
    const { execute: executeUpdateProfile } = useFetch(apiConfig.user.updateProfile);
    const { execute: executeStudentUpdate } = useFetch(apiConfig.student.clientUpdate);

    const [ categories, setCategories ] = useState([]);
    const [ organizations, setOrganizations ] = useState([]);
    const [ selectedSpecializations, setSelectedSpecializations ] = useState([]);
    const [ selectedOrganizations, setSelectedOrganizations ] = useState([]);

    const { execute: fetchCategories, loading: categoriesLoading } = useFetch(apiConfig.category.autoComplete);
    const { execute: fetchOrganizations, loading: organizationsLoading } = useFetch(apiConfig.organization.list);

    useEffect(() => {
        if (isStudent) {
            fetchCategories({
                params: { kind: 1 },
                onCompleted: (res) => {
                    if (res?.result === true && res?.data) {
                        const categoriesArray = Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res.data.content)
                                ? res.data.content
                                : [];
                        setCategories(categoriesArray);
                    }
                },
            });
            fetchOrganizations({
                onCompleted: (res) => {
                    if (res?.result === true && res?.data) {
                        const orgArray = Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res.data.content)
                                ? res.data.content
                                : [];
                        setOrganizations(orgArray);
                    }
                },
            });
        }
    }, [ isStudent, fetchCategories, fetchOrganizations ]);

    useEffect(() => {
        if (user && isStudent) {
            const prefs = user.preferences || [];
            const specIds = prefs.map((p) => p.specializationId).filter((id) => id && id !== 0);
            const orgIds = prefs.map((p) => p.organizationId).filter((id) => id && id !== 0);

            setSelectedSpecializations(specIds);
            setSelectedOrganizations(orgIds);
        }
    }, [ user, isStudent ]);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const [ imageUrl, setImageUrl ] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const fileInputRef = useRef(null);
    const editingFieldRef = useRef(null);
    const [ editingField, setEditingField ] = useState(null);

    const getAvatarUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${AppConstants.contentRootUrl}${path}`;
    };

    const avatarUrl = getAvatarUrl(imageUrl || avatarRaw);

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            executeUpFile({
                data: {
                    type: 'AVATAR',
                    file,
                },
                onCompleted: (response) => {
                    if (response?.result === true && response?.data?.filePath) {
                        setImageUrl(response.data.filePath);
                        toast.success('Cập nhật ảnh đại diện thành công!');
                    } else {
                        toast.error(response?.message || 'Không thể tải ảnh lên.');
                    }
                },
                onError: () => {
                    toast.error('Có lỗi xảy ra khi tải ảnh lên.');
                },
            });
        }
    };

    useEffect(() => {
        if (imageUrl) {
            form.setFieldValue('avatarPath', imageUrl);
        }
    }, [ imageUrl ]);

    const onFinish = () => {
        const values = form.getFieldsValue();
        if (isStudent) {
            const preferences = [];
            selectedSpecializations.forEach((specId) => {
                preferences.push({ specializationId: specId });
            });
            selectedOrganizations.forEach((orgId) => {
                preferences.push({ organizationId: orgId });
            });

            let fullname = '';
            if (values.firstName && values.lastName) {
                fullname = `${values.firstName} ${values.lastName}`.trim();
            } else if (values.firstName) {
                fullname = values.firstName;
            } else if (values.lastName) {
                fullname = values.lastName;
            } else {
                fullname = user?.fullName || user?.account?.fullName || '';
            }

            executeStudentUpdate({
                data: {
                    avatarPath: imageUrl || user?.avatar || user?.avatarPath || '',
                    fullname,
                    phone: values.phone || user?.phone || user?.account?.phone || '',
                    birthday: values.birthday
                        ? dayjs(values.birthday).format('DD/MM/YYYY 00:00:00')
                        : user?.birthday || user?.account?.birthday || null,
                    username: values.username || user?.username || user?.account?.username || '',
                    preferences,
                },
                onCompleted: () => {
                    toast.success(translate.formatMessage(commonMessage.success));
                    localStorage.removeItem('editingField');
                    editingFieldRef.current = null;
                    setEditingField(null);
                    if (executeGetProfile) {
                        executeGetProfile();
                    }
                },
                onError: () => {
                    toast.error(translate.formatMessage(commonMessage.fail));
                },
            });
        } else {
            executeUpdateProfile({
                data: {
                    ...values,
                },
                onCompleted: () => {
                    toast.success(translate.formatMessage(commonMessage.success));
                    localStorage.removeItem('editingField');
                    editingFieldRef.current = null;
                    setEditingField(null);
                    if (executeGetProfile) {
                        executeGetProfile();
                    }
                },
                onError: () => {
                    toast.error(translate.formatMessage(commonMessage.fail));
                },
            });
        }
    };

    useEffect(() => {
        if (user) {
            const currentEditingField = editingField;
            form.setFieldsValue({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || user.account?.email || '',
                fullName: user.fullName || user.account?.fullName || '',
                phone: user.phone || user.account?.phone || '',
                gender:
                    user.gender === MALE
                        ? translate.formatMessage(commonMessage.male)
                        : translate.formatMessage(commonMessage.female),
            });
            setImageUrl(user.avatar || user.avatarPath);
            setEditingField(currentEditingField);
        }
    }, [ user, form, editingField ]);

    const handleSetEditingField = (field) => {
        if (editingFieldRef.current === field) {
            editingFieldRef.current = null;
            setEditingField(null);
            localStorage.removeItem('editingField');
        } else {
            editingFieldRef.current = field;
            setEditingField(field);
            localStorage.setItem('editingField', field);
        }
    };

    useEffect(() => {
        const savedEditingField = localStorage.getItem('editingField');
        if (savedEditingField && savedEditingField !== 'null') {
            editingFieldRef.current = savedEditingField;
            setEditingField(savedEditingField);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('editingField', null);
        navigation(
            generatePath(`${routes.homePage.path}`, {
                restaurantId: params.restaurantId,
            }),
        );
    };

    return (
        <div className={styles.wrapper}>
            <Form className={styles.form} form={form}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg, image/jpg"
                />
                <div className={styles.header}>
                    <div className={styles.titleProfile}>
                        <TbUser style={{ fontSize: '22px', marginRight: '8px', color: '#16a34a' }} />
                        <span>{translate.formatMessage(messages.profilePage)}</span>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                        <IconClose style={{ width: '12px', height: '12px' }} />
                    </button>
                </div>

                <div className={styles.profileHero}>
                    <div className={styles.heroSummary}>
                        <div
                            className={styles.heroAvatar}
                            onClick={handleAvatarClick}
                            title="Nhấp để thay đổi ảnh đại diện"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={fullName || 'Avatar'} />
                            ) : (
                                <div className={styles.heroAvatarPlaceholder}>
                                    {(fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={styles.avatarOverlay}>
                                <TbCamera className={styles.cameraIcon} />
                                <span>Thay đổi</span>
                            </div>
                        </div>
                        <div className={styles.heroDetails}>
                            <div className={styles.heroTitle}>
                                {fullName || translate.formatMessage(messages.profileUser)}
                            </div>
                            {organizationName ? (
                                <div className={styles.heroOrganization}>
                                    <TbBriefcase
                                        style={{ marginRight: '6px', fontSize: '15px', verticalAlign: 'middle' }}
                                    />
                                    <span>{organizationName}</span>
                                </div>
                            ) : null}
                            <div className={styles.heroBadges}>
                                {reviewStatus !== undefined ? (
                                    <span
                                        className={`${styles.profileBadge} ${reviewStatus ? styles.badgeSuccess : styles.badgeWarning}`}
                                    >
                                        {reviewStatus ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                ) : null}
                                {genderLabel ? <span className={styles.profileBadge}>{genderLabel}</span> : null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroStatGrid}>
                        {email ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>
                                    <TbMail style={{ marginRight: '6px', fontSize: '13px', verticalAlign: 'middle' }} />
                                    <span>{translate.formatMessage(messages.email)}</span>
                                </div>
                                <div className={styles.heroStatValue}>{email}</div>
                            </div>
                        ) : null}
                        {phone ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>
                                    <TbPhone
                                        style={{ marginRight: '6px', fontSize: '13px', verticalAlign: 'middle' }}
                                    />
                                    <span>{translate.formatMessage(messages.phone)}</span>
                                </div>
                                <div className={styles.heroStatValue}>{phone}</div>
                            </div>
                        ) : null}
                        {firstName ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>
                                    <TbUser style={{ marginRight: '6px', fontSize: '13px', verticalAlign: 'middle' }} />
                                    <span>{translate.formatMessage(messages.firstName)}</span>
                                </div>
                                <div className={styles.heroStatValue}>{firstName}</div>
                            </div>
                        ) : null}
                        {lastName ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>
                                    <TbUser style={{ marginRight: '6px', fontSize: '13px', verticalAlign: 'middle' }} />
                                    <span>{translate.formatMessage(messages.lastName)}</span>
                                </div>
                                <div className={styles.heroStatValue}>{lastName}</div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={styles.body}>
                    {/* Username Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'username' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbUser className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>Tên đăng nhập</span>
                                </div>
                                {editingField === 'username' ? (
                                    <div className={styles.fieldEditor}>
                                        <div className={styles.editorSubtitle}>Thông tin cá nhân</div>
                                        <div className={styles.editorInputs}>
                                            <InputField name="username" required placeholder="Nhập tên đăng nhập" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.fieldValue}>
                                        {user?.username || user?.account?.username || '—'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={`${styles.editBtn} ${editingField === 'username' ? styles.cancel : ''}`}
                                onClick={() => handleSetEditingField('username')}
                            >
                                {editingField === 'username' ? (
                                    <>
                                        <TbX />
                                        <span>Huỷ</span>
                                    </>
                                ) : (
                                    <>
                                        <TbEdit />
                                        <span>Thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {editingField === 'username' && (
                            <div className={styles.fieldActions}>
                                <button type="button" className={styles.btnUpdate} onClick={onFinish}>
                                    <TbCheck style={{ marginRight: '6px' }} />
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Full Name Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'fullName' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbUser className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>
                                        {translate.formatMessage(messages.fullName)}
                                    </span>
                                </div>
                                {editingField === 'fullName' ? (
                                    <div className={styles.fieldEditor}>
                                        <div className={styles.editorSubtitle}>
                                            {translate.formatMessage(messages.personalInformation)}
                                        </div>
                                        <div className={styles.editorInputs}>
                                            <Grid>
                                                <Grid.Col span={6}>
                                                    <InputField
                                                        name="firstName"
                                                        required
                                                        label={translate.formatMessage(messages.firstName)}
                                                        placeholder={translate.formatMessage(messages.enterFirstName)}
                                                    />
                                                </Grid.Col>
                                                <Grid.Col span={6}>
                                                    <InputField
                                                        name="lastName"
                                                        required
                                                        label={translate.formatMessage(messages.lastName)}
                                                        placeholder={translate.formatMessage(messages.enterLastName)}
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.fieldValue}>
                                        {user?.fullName || user?.account?.fullName || '—'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={`${styles.editBtn} ${editingField === 'fullName' ? styles.cancel : ''}`}
                                onClick={() => handleSetEditingField('fullName')}
                            >
                                {editingField === 'fullName' ? (
                                    <>
                                        <TbX />
                                        <span>Huỷ</span>
                                    </>
                                ) : (
                                    <>
                                        <TbEdit />
                                        <span>Thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {editingField === 'fullName' && (
                            <div className={styles.fieldActions}>
                                <button type="button" className={styles.btnUpdate} onClick={onFinish}>
                                    <TbCheck style={{ marginRight: '6px' }} />
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Phone Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'phone' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbPhone className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>{translate.formatMessage(messages.phone)}</span>
                                </div>
                                {editingField === 'phone' ? (
                                    <div className={styles.fieldEditor}>
                                        <div className={styles.editorSubtitle}>
                                            {translate.formatMessage(messages.personalInformation)}
                                        </div>
                                        <div className={styles.editorInputs}>
                                            <InputField
                                                name="phone"
                                                required
                                                placeholder={translate.formatMessage(messages.enterPhone)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.fieldValue}>
                                        {user?.phone || user?.account?.phone || '—'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={`${styles.editBtn} ${editingField === 'phone' ? styles.cancel : ''}`}
                                onClick={() => handleSetEditingField('phone')}
                            >
                                {editingField === 'phone' ? (
                                    <>
                                        <TbX />
                                        <span>Huỷ</span>
                                    </>
                                ) : (
                                    <>
                                        <TbEdit />
                                        <span>Thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {editingField === 'phone' && (
                            <div className={styles.fieldActions}>
                                <button type="button" className={styles.btnUpdate} onClick={onFinish}>
                                    <TbCheck style={{ marginRight: '6px' }} />
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Birthday Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'birthday' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbCalendar className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>Ngày sinh</span>
                                </div>
                                {editingField === 'birthday' ? (
                                    <div className={styles.fieldEditor}>
                                        <div className={styles.editorSubtitle}>Thông tin cá nhân</div>
                                        <div className={styles.editorInputs}>
                                            <DatePickerField
                                                name="birthday"
                                                format="DD/MM/YYYY"
                                                placeholder="Chọn ngày sinh"
                                                showTime={false}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.fieldValue}>
                                        {user?.birthday || user?.account?.birthday
                                            ? dayjs(
                                                user?.birthday || user?.account?.birthday,
                                                'DD/MM/YYYY HH:mm:ss',
                                            ).format('DD/MM/YYYY')
                                            : '—'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={`${styles.editBtn} ${editingField === 'birthday' ? styles.cancel : ''}`}
                                onClick={() => handleSetEditingField('birthday')}
                            >
                                {editingField === 'birthday' ? (
                                    <>
                                        <TbX />
                                        <span>Huỷ</span>
                                    </>
                                ) : (
                                    <>
                                        <TbEdit />
                                        <span>Thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {editingField === 'birthday' && (
                            <div className={styles.fieldActions}>
                                <button type="button" className={styles.btnUpdate} onClick={onFinish}>
                                    <TbCheck style={{ marginRight: '6px' }} />
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preferences Row */}
                    {isStudent && (
                        <div className={`${styles.fieldCard} ${editingField === 'preferences' ? styles.editing : ''}`}>
                            <div className={styles.fieldHeader}>
                                <div className={styles.fieldLabelSection} style={{ width: '100%', textAlign: 'left' }}>
                                    <div className={styles.fieldIconTitle}>
                                        <TbBriefcase className={styles.fieldIcon} />
                                        <span className={styles.fieldTitle}>Chuyên ngành & Tổ chức quan tâm</span>
                                    </div>
                                    {editingField === 'preferences' ? (
                                        <div className={styles.fieldEditor} style={{ marginTop: 16 }}>
                                            <div className={styles.editorSubtitle} style={{ marginBottom: 12 }}>
                                                Chọn các chuyên ngành và tổ chức bạn quan tâm để lưu vào hồ sơ
                                            </div>
                                            <div
                                                className={styles.editorInputs}
                                                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                                            >
                                                <div>
                                                    <label
                                                        style={{
                                                            display: 'block',
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            marginBottom: 6,
                                                            color: '#4a5568',
                                                        }}
                                                    >
                                                        Chuyên ngành quan tâm
                                                    </label>
                                                    <Select
                                                        mode="multiple"
                                                        placeholder="Chọn chuyên ngành"
                                                        value={selectedSpecializations}
                                                        onChange={setSelectedSpecializations}
                                                        style={{ width: '100%' }}
                                                        options={(Array.isArray(categories) ? categories : []).map(
                                                            (cat) => ({
                                                                label: cat.name,
                                                                value: cat.id,
                                                            }),
                                                        )}
                                                        loading={categoriesLoading}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        style={{
                                                            display: 'block',
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            marginBottom: 6,
                                                            color: '#4a5568',
                                                        }}
                                                    >
                                                        Tổ chức quan tâm
                                                    </label>
                                                    <Select
                                                        mode="multiple"
                                                        placeholder="Chọn tổ chức"
                                                        value={selectedOrganizations}
                                                        onChange={setSelectedOrganizations}
                                                        style={{ width: '100%' }}
                                                        optionLabelProp="labelName"
                                                        options={(Array.isArray(organizations)
                                                            ? organizations
                                                            : []
                                                        ).map((org) => {
                                                            const logo = getAvatarUrl(org.logoUrl);
                                                            return {
                                                                label: (
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 8,
                                                                        }}
                                                                    >
                                                                        {logo ? (
                                                                            <img
                                                                                src={logo}
                                                                                alt={org.name || org.shortName}
                                                                                style={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    objectFit: 'cover',
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: '#e2e8f0',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: 10,
                                                                                    fontWeight: 'bold',
                                                                                    color: '#4a5568',
                                                                                }}
                                                                            >
                                                                                {(org.name || org.shortName || 'O')
                                                                                    .charAt(0)
                                                                                    .toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <span>{org.name || org.shortName}</span>
                                                                    </div>
                                                                ),
                                                                value: org.id,
                                                                labelName: org.name || org.shortName,
                                                            };
                                                        })}
                                                        loading={organizationsLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.fieldValue}
                                            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        color: '#718096',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Chuyên ngành quan tâm:
                                                </div>
                                                {selectedSpecializations.length > 0 ? (
                                                    <div className={styles.preferencePillsContainer}>
                                                        {selectedSpecializations
                                                            .map((id) =>
                                                                (Array.isArray(categories) ? categories : []).find(
                                                                    (c) => c.id === id,
                                                                ),
                                                            )
                                                            .filter(Boolean)
                                                            .map((cat) => (
                                                                <span
                                                                    key={cat.id}
                                                                    className={`${styles.preferencePill} ${styles.specialization}`}
                                                                >
                                                                    {cat.name}
                                                                </span>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{ fontStyle: 'italic', color: '#a0aec0', fontSize: 13 }}
                                                    >
                                                        Chưa chọn chuyên ngành
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        color: '#718096',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Tổ chức quan tâm:
                                                </div>
                                                {selectedOrganizations.length > 0 ? (
                                                    <div className={styles.preferencePillsContainer}>
                                                        {selectedOrganizations
                                                            .map((id) =>
                                                                (Array.isArray(organizations)
                                                                    ? organizations
                                                                    : []
                                                                ).find((o) => o.id === id),
                                                            )
                                                            .filter(Boolean)
                                                            .map((org) => {
                                                                const logo = getAvatarUrl(org.logoUrl);
                                                                return (
                                                                    <span
                                                                        key={org.id}
                                                                        className={`${styles.preferencePill} ${styles.organization}`}
                                                                    >
                                                                        {logo ? (
                                                                            <img
                                                                                src={logo}
                                                                                alt={org.name || org.shortName}
                                                                                style={{
                                                                                    width: 16,
                                                                                    height: 16,
                                                                                    borderRadius: '50%',
                                                                                    objectFit: 'cover',
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    width: 16,
                                                                                    height: 16,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: '#bfdbfe',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: 8,
                                                                                    fontWeight: 'bold',
                                                                                    color: '#1e40af',
                                                                                }}
                                                                            >
                                                                                {(org.name || org.shortName || 'O')
                                                                                    .charAt(0)
                                                                                    .toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <span>{org.name || org.shortName}</span>
                                                                    </span>
                                                                );
                                                            })}
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{ fontStyle: 'italic', color: '#a0aec0', fontSize: 13 }}
                                                    >
                                                        Chưa chọn tổ chức
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.editBtn} ${editingField === 'preferences' ? styles.cancel : ''}`}
                                    onClick={() => handleSetEditingField('preferences')}
                                >
                                    {editingField === 'preferences' ? (
                                        <>
                                            <TbX />
                                            <span>Huỷ</span>
                                        </>
                                    ) : (
                                        <>
                                            <TbEdit />
                                            <span>Thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {editingField === 'preferences' && (
                                <div className={styles.fieldActions}>
                                    <button type="button" className={styles.btnUpdate} onClick={onFinish}>
                                        <TbCheck style={{ marginRight: '6px' }} />
                                        Lưu thay đổi
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Form>
        </div>
    );
};

export default ProfileComponent;
