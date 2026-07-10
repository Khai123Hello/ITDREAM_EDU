import React, { useEffect, useRef, useState } from 'react';
import { TbBriefcase, TbCalendar, TbCamera, TbCheck, TbEdit, TbMail, TbPhone, TbUser, TbX } from 'react-icons/tb';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getCacheUserKind } from '@services/userService';
import { actions as accountActions } from '@store/actions/account';
import { toast } from 'sonner';

import styles from './index.module.scss';

const getSpecIcon = (name) => {
    const n = name ? name.toLowerCase() : '';
    if (n.includes('frontend') || n.includes('web')) return '💻';
    if (
        n.includes('backend') ||
        n.includes('java') ||
        n.includes('python') ||
        n.includes('node') ||
        n.includes('c#') ||
        n.includes('golang')
    )
        return '⚙️';
    if (n.includes('design') || n.includes('ui') || n.includes('ux') || n.includes('figma') || n.includes('product'))
        return '🎨';
    if (n.includes('test') || n.includes('tester') || n.includes('qa') || n.includes('qc') || n.includes('automation'))
        return '🧪';
    if (
        n.includes('mobile') ||
        n.includes('android') ||
        n.includes('ios') ||
        n.includes('flutter') ||
        n.includes('react native')
    )
        return '📱';
    if (
        n.includes('cloud') ||
        n.includes('devops') ||
        n.includes('docker') ||
        n.includes('aws') ||
        n.includes('kubernetes')
    )
        return '☁️';
    if (
        n.includes('data') ||
        n.includes('analyst') ||
        n.includes('ai') ||
        n.includes('machine') ||
        n.includes('python') ||
        n.includes('science')
    )
        return '📊';
    return '🚀';
};

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
    const dispatch = useDispatch();
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

    const getAvatarUrl = (path) => getDownloadUrl(path);

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
                        const newAvatarPath = response.data.filePath;
                        setImageUrl(newAvatarPath);

                        // Tự động lưu ảnh đại diện mới vào thông tin cá nhân
                        if (isStudent) {
                            const prefs = user?.preferences || [];
                            const preferences = prefs.map((p) => ({
                                specializationId: p.specializationId,
                                organizationId: p.organizationId,
                            }));
                            executeStudentUpdate({
                                data: {
                                    avatarPath: newAvatarPath,
                                    fullname: fullName,
                                    phone: phone,
                                    birthday: user?.birthday || user?.account?.birthday || null,
                                    username: user?.username || user?.account?.username || '',
                                    preferences,
                                },
                                onCompleted: (res) => {
                                    if (res?.result === true) {
                                        toast.success('Cập nhật ảnh đại diện thành công!');
                                        if (executeGetProfile) {
                                            executeGetProfile()
                                                .then(() => {
                                                    window.location.reload();
                                                })
                                                .catch(() => {
                                                    window.location.reload();
                                                });
                                        } else {
                                            dispatch(accountActions.getProfile());
                                            window.location.reload();
                                        }
                                    } else {
                                        toast.error(res?.message || 'Không thể cập nhật ảnh đại diện.');
                                    }
                                },
                                onError: () => {
                                    toast.error('Không thể lưu ảnh đại diện vào hồ sơ.');
                                },
                            });
                        } else {
                            executeUpdateProfile({
                                data: {
                                    avatarPath: newAvatarPath,
                                },
                                onCompleted: (res) => {
                                    if (res?.result === true) {
                                        toast.success('Cập nhật ảnh đại diện thành công!');
                                        if (executeGetProfile) {
                                            executeGetProfile()
                                                .then(() => {
                                                    window.location.reload();
                                                })
                                                .catch(() => {
                                                    window.location.reload();
                                                });
                                        } else {
                                            dispatch(accountActions.getProfile());
                                            window.location.reload();
                                        }
                                    } else {
                                        toast.error(res?.message || 'Không thể cập nhật ảnh đại diện.');
                                    }
                                },
                                onError: () => {
                                    toast.error('Không thể lưu ảnh đại diện vào hồ sơ.');
                                },
                            });
                        }
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
                onCompleted: (res) => {
                    if (res?.result === true) {
                        toast.success(translate.formatMessage(commonMessage.success));
                        localStorage.removeItem('editingField');
                        editingFieldRef.current = null;
                        setEditingField(null);
                        if (executeGetProfile) {
                            executeGetProfile()
                                .then(() => {
                                    window.location.reload();
                                })
                                .catch(() => {
                                    window.location.reload();
                                });
                        } else {
                            dispatch(accountActions.getProfile());
                            window.location.reload();
                        }
                    } else {
                        toast.error(res?.message || translate.formatMessage(commonMessage.fail));
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
                onCompleted: (res) => {
                    if (res?.result === true) {
                        toast.success(translate.formatMessage(commonMessage.success));
                        localStorage.removeItem('editingField');
                        editingFieldRef.current = null;
                        setEditingField(null);
                        if (executeGetProfile) {
                            executeGetProfile()
                                .then(() => {
                                    window.location.reload();
                                })
                                .catch(() => {
                                    window.location.reload();
                                });
                        } else {
                            dispatch(accountActions.getProfile());
                            window.location.reload();
                        }
                    } else {
                        toast.error(res?.message || translate.formatMessage(commonMessage.fail));
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
        navigation('/');
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
                        <TbX style={{ width: '14px', height: '14px' }} />
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
                                        <span className={styles.fieldTitle}>
                                            Tôi muốn trở thành ai? (Mục tiêu nghề nghiệp & Đối tác)
                                        </span>
                                    </div>
                                    {editingField === 'preferences' ? (
                                        <div className={styles.fieldEditor} style={{ marginTop: 16 }}>
                                            <div
                                                className={styles.editorSubtitle}
                                                style={{ marginBottom: 16, fontSize: '13px', color: '#64748b' }}
                                            >
                                                Chọn chuyên ngành bạn muốn phát triển và các doanh nghiệp bạn quan tâm
                                                để lưu làm mục tiêu nghề nghiệp.
                                            </div>
                                            <div
                                                className={styles.editorInputs}
                                                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                                            >
                                                <div>
                                                    <label
                                                        style={{
                                                            display: 'block',
                                                            fontSize: 14,
                                                            fontWeight: 700,
                                                            marginBottom: 8,
                                                            color: '#1e293b',
                                                        }}
                                                    >
                                                        🎯 Vai trò & Chuyên ngành mục tiêu
                                                    </label>
                                                    <div className={styles.prefVisualGrid}>
                                                        {(Array.isArray(categories) ? categories : []).map((cat) => {
                                                            const isSelected = selectedSpecializations.includes(cat.id);
                                                            return (
                                                                <div
                                                                    key={cat.id}
                                                                    className={`${styles.prefVisualCard} ${isSelected ? styles.prefVisualCardSelected : ''}`}
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            setSelectedSpecializations(
                                                                                selectedSpecializations.filter(
                                                                                    (id) => id !== cat.id,
                                                                                ),
                                                                            );
                                                                        } else {
                                                                            setSelectedSpecializations([
                                                                                ...selectedSpecializations,
                                                                                cat.id,
                                                                            ]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <span className={styles.prefVisualIcon}>
                                                                        {getSpecIcon(cat.name)}
                                                                    </span>
                                                                    <span className={styles.prefVisualName}>
                                                                        {cat.name}
                                                                    </span>
                                                                    <div className={styles.prefVisualCheck}>
                                                                        <TbCheck className={styles.checkIcon} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        style={{
                                                            display: 'block',
                                                            fontSize: 14,
                                                            fontWeight: 700,
                                                            marginBottom: 8,
                                                            color: '#1e293b',
                                                        }}
                                                    >
                                                        🏢 Doanh nghiệp & Đối tác mục tiêu
                                                    </label>
                                                    <div className={styles.orgVisualGrid}>
                                                        {(Array.isArray(organizations) ? organizations : []).map(
                                                            (org) => {
                                                                const isSelected = selectedOrganizations.includes(
                                                                    org.id,
                                                                );
                                                                const logo = getAvatarUrl(org.logoUrl);
                                                                return (
                                                                    <div
                                                                        key={org.id}
                                                                        className={`${styles.orgVisualCard} ${isSelected ? styles.orgVisualCardSelected : ''}`}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                setSelectedOrganizations(
                                                                                    selectedOrganizations.filter(
                                                                                        (id) => id !== org.id,
                                                                                    ),
                                                                                );
                                                                            } else {
                                                                                setSelectedOrganizations([
                                                                                    ...selectedOrganizations,
                                                                                    org.id,
                                                                                ]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className={styles.orgVisualLogo}>
                                                                            {logo ? (
                                                                                <img src={logo} alt={org.name} />
                                                                            ) : (
                                                                                <span>
                                                                                    {org.name?.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className={styles.orgVisualName}>
                                                                            {org.shortName || org.name}
                                                                        </span>
                                                                        <div className={styles.orgVisualCheck}>
                                                                            <TbCheck className={styles.checkIcon} />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
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
