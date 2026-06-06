import React, { useEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as IconClose } from '@assets/icons/closeModal.svg';
import { Form } from '@components/common/elements/Form';
import Grid from '@components/common/elements/Grid';
import { InputField } from '@components/common/elements/Input';
import { MALE } from '@constants';
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
    const avatarUrl = user?.avatar || user?.avatarPath || '';
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
                <div className={styles.header}>
                    <div className={styles.titleProfile}>{translate.formatMessage(messages.profilePage)}</div>
                    <IconClose style={{ width: '15px', height: '15px', cursor: 'pointer' }} onClick={handleClose} />
                </div>
                <div className={styles.profileHero}>
                    <div className={styles.heroSummary}>
                        <div className={styles.heroAvatar}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={fullName || 'Avatar'} />
                            ) : (
                                <div className={styles.heroAvatarPlaceholder}>{fullName?.charAt(0) || 'U'}</div>
                            )}
                        </div>
                        <div className={styles.heroDetails}>
                            <div className={styles.heroTitle}>
                                {fullName || translate.formatMessage(messages.profileUser)}
                            </div>
                            {organizationName ? (
                                <div className={styles.heroOrganization}>{organizationName}</div>
                            ) : null}
                            <div className={styles.heroBadges}>
                                {reviewStatus !== undefined ? (
                                    <span className={styles.profileBadge}>
                                        {reviewStatus ? 'Reviewed' : 'Pending review'}
                                    </span>
                                ) : null}
                                {genderLabel ? <span className={styles.profileBadge}>{genderLabel}</span> : null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroStatGrid}>
                        {email ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>{translate.formatMessage(messages.email)}</div>
                                <div className={styles.heroStatValue}>{email}</div>
                            </div>
                        ) : null}
                        {phone ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>{translate.formatMessage(messages.phone)}</div>
                                <div className={styles.heroStatValue}>{phone}</div>
                            </div>
                        ) : null}
                        {firstName ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>
                                    {translate.formatMessage(messages.firstName)}
                                </div>
                                <div className={styles.heroStatValue}>{firstName}</div>
                            </div>
                        ) : null}
                        {lastName ? (
                            <div className={styles.heroStatCard}>
                                <div className={styles.heroStatLabel}>{translate.formatMessage(messages.lastName)}</div>
                                <div className={styles.heroStatValue}>{lastName}</div>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className={styles.body}>
                    <div className={styles.fullName}>
                        <div className={styles.headerFullName}>
                            <div>
                                <div className={styles.title}>{translate.formatMessage(messages.fullName)}</div>
                                {editingField === 'fullName' ? (
                                    <>
                                        <div style={{ marginBottom: '18px' }}>
                                            <div className={styles.shortDescription}>
                                                {translate.formatMessage(messages.personalInformation)}
                                            </div>
                                        </div>
                                        <div className={styles.title}>{translate.formatMessage(messages.fullName)}</div>
                                        <div style={{ padding: '10px 0px', width: '100%' }}>
                                            <Grid>
                                                <Grid.Col span={6} className={styles.label}>
                                                    <InputField
                                                        name="firstName"
                                                        required
                                                        placeholder={translate.formatMessage(messages.enterFirstName)}
                                                    />
                                                </Grid.Col>
                                                <Grid.Col span={6} className={styles.label}>
                                                    <InputField
                                                        name="lastName"
                                                        required
                                                        placeholder={translate.formatMessage(messages.enterFirstName)}
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.shortDescription}>
                                        {user?.fullName || user?.account?.fullName}
                                    </div>
                                )}
                            </div>
                            <div
                                className={styles.back}
                                onClick={() => handleSetEditingField('fullName')}
                                style={{ cursor: 'pointer' }}
                            >
                                {editingField === 'fullName'
                                    ? translate.formatMessage(commonMessage.cancel)
                                    : translate.formatMessage(commonMessage.edit)}
                            </div>
                        </div>
                        {editingField === 'fullName' && (
                            <div className={styles.bodyFullName}>
                                <div className={styles.btnUpdate} onClick={() => onFinish()}>
                                    {translate.formatMessage(commonMessage.update)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.fullName}>
                        <div className={styles.headerFullName}>
                            <div>
                                <div className={styles.title}>{translate.formatMessage(messages.email)}</div>
                                {editingField === 'email' ? (
                                    <>
                                        <div style={{ marginBottom: '18px' }} className={styles.shortDescription}>
                                            {translate.formatMessage(messages.personalInformation)}
                                        </div>
                                        <div className={styles.title}>{translate.formatMessage(messages.email)}</div>
                                        <div style={{ padding: '10px 0px', width: '100%' }}>
                                            <InputField
                                                name="email"
                                                required
                                                placeholder={translate.formatMessage(messages.enterEmail)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.shortDescription}>{user?.email || user?.account?.email}</div>
                                )}
                            </div>
                            <div
                                className={styles.back}
                                onClick={() => handleSetEditingField('email')}
                                style={{ cursor: 'pointer' }}
                            >
                                {editingField === 'email'
                                    ? translate.formatMessage(commonMessage.cancel)
                                    : translate.formatMessage(commonMessage.edit)}
                            </div>
                        </div>
                        {editingField === 'email' && (
                            <div className={styles.bodyFullName}>
                                <div className={styles.btnUpdate} onClick={() => onFinish()}>
                                    {translate.formatMessage(commonMessage.update)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.fullName}>
                        <div className={styles.headerFullName}>
                            <div>
                                <div className={styles.title}>{translate.formatMessage(messages.phone)}</div>
                                {editingField === 'phone' ? (
                                    <>
                                        <div style={{ marginBottom: '18px' }} className={styles.shortDescription}>
                                            {translate.formatMessage(messages.personalInformation)}
                                        </div>
                                        <div className={styles.title}>{translate.formatMessage(messages.phone)}</div>
                                        <div style={{ padding: '10px 0px', width: '100%' }}>
                                            <InputField
                                                name="phone"
                                                required
                                                placeholder={translate.formatMessage(messages.enterPhone)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.shortDescription}>{user?.phone || user?.account?.phone}</div>
                                )}
                            </div>
                            <div
                                className={styles.back}
                                onClick={() => handleSetEditingField('phone')}
                                style={{ cursor: 'pointer' }}
                            >
                                {editingField === 'phone'
                                    ? translate.formatMessage(commonMessage.cancel)
                                    : translate.formatMessage(commonMessage.edit)}
                            </div>
                        </div>
                        {editingField === 'phone' && (
                            <div className={styles.bodyFullName}>
                                <div className={styles.btnUpdate} onClick={() => onFinish()}>
                                    {translate.formatMessage(commonMessage.update)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </div>
    );
};

export default ProfileComponent;
