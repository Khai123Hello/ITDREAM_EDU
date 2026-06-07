import React, { useEffect, useRef, useState } from 'react';
import { TbBriefcase, TbCamera, TbCheck, TbEdit, TbMail, TbPhone, TbUser, TbX } from 'react-icons/tb';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as IconClose } from '@assets/icons/closeModal.svg';
import { Form } from '@components/common/elements/Form';
import Grid from '@components/common/elements/Grid';
import { InputField } from '@components/common/elements/Input';
import { AppConstants,MALE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@constants/intl';
import useAuth from '@hooks/useAuth';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import routes from '@routes';
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
    const { formId, actions, dataDetail, onSubmit, setIsChangedFormValues, groups, branchs, data } = props;
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

    const { execute: executeUpdateProfile } = useFetch(apiConfig.user.updateProfile);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const [ imageUrl, setImageUrl ] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const fileInputRef = useRef(null);

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
        executeUpdateProfile({
            data: {
                ...values,
            },
            onCompleted: (res) => {
                toast.success(translate.formatMessage(commonMessage.success));
            },
            onError: (err) => {
                toast.error(translate.formatMessage(commonMessage.fail));
            },
        });
    };

    const editingFieldRef = useRef(null);
    const [ editingField, setEditingField ] = useState(null);

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
            localStorage.setItem('editingField', null);
        } else {
            editingFieldRef.current = field;
            setEditingField(field);
            localStorage.setItem('editingField', field);
        }
    };

    useEffect(() => {
        const savedEditingField = localStorage.getItem('editingField');
        if (savedEditingField) {
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
                        <div className={styles.heroAvatar} onClick={handleAvatarClick} title="Nhấp để thay đổi ảnh đại diện">
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
                                    <TbBriefcase style={{ marginRight: '6px', fontSize: '15px', verticalAlign: 'middle' }} />
                                    <span>{organizationName}</span>
                                </div>
                            ) : null}
                            <div className={styles.heroBadges}>
                                {reviewStatus !== undefined ? (
                                    <span className={`${styles.profileBadge} ${reviewStatus ? styles.badgeSuccess : styles.badgeWarning}`}>
                                        {reviewStatus ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                ) : null}
                                {genderLabel ? (
                                    <span className={styles.profileBadge}>
                                        {genderLabel}
                                    </span>
                                ) : null}
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
                                    <TbPhone style={{ marginRight: '6px', fontSize: '13px', verticalAlign: 'middle' }} />
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
                    {/* Full Name Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'fullName' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbUser className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>{translate.formatMessage(messages.fullName)}</span>
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

                    {/* Email Row */}
                    <div className={`${styles.fieldCard} ${editingField === 'email' ? styles.editing : ''}`}>
                        <div className={styles.fieldHeader}>
                            <div className={styles.fieldLabelSection}>
                                <div className={styles.fieldIconTitle}>
                                    <TbMail className={styles.fieldIcon} />
                                    <span className={styles.fieldTitle}>{translate.formatMessage(messages.email)}</span>
                                </div>
                                {editingField === 'email' ? (
                                    <div className={styles.fieldEditor}>
                                        <div className={styles.editorSubtitle}>
                                            {translate.formatMessage(messages.personalInformation)}
                                        </div>
                                        <div className={styles.editorInputs}>
                                            <InputField
                                                name="email"
                                                required
                                                type="email"
                                                placeholder={translate.formatMessage(messages.enterEmail)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.fieldValue}>
                                        {user?.email || user?.account?.email || '—'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className={`${styles.editBtn} ${editingField === 'email' ? styles.cancel : ''}`}
                                onClick={() => handleSetEditingField('email')}
                            >
                                {editingField === 'email' ? (
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
                        {editingField === 'email' && (
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
                </div>
            </Form>
        </div>
    );
};

export default ProfileComponent;
