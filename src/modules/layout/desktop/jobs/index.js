import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TipTapJsonRenderer from '@components/common/editor/TipTapJsonRenderer';
import LoadingComponent from '@components/common/loading/LoadingComponent';
import {
    AppConstants,
    JOB_POST_ROLE_ATOMS,
    JOB_POST_ROLE_TYPE_ALL,
    JOB_POST_ROLE_TYPE_FULL_TIMES,
    JOB_POST_ROLE_TYPE_INTERNSHIP,
    JOB_POST_ROLE_TYPE_INTERNSHIP_FULL_TIMES,
    JOB_POST_ROLE_TYPE_INTERNSHIP_PART_TIMES,
    JOB_POST_ROLE_TYPE_MAP,
    JOB_POST_ROLE_TYPE_OPTIONS,
    JOB_POST_ROLE_TYPE_PART_TIMES,
    JOB_POST_ROLE_TYPE_PART_TIMES_FULL_TIMES,
    JOB_POST_TYPE_EVENT,
    JOB_POST_TYPE_JOB,
    JOB_POST_TYPE_MAP,
    JOB_POST_TYPE_OPTIONS,
    JOB_POST_TYPE_TALENT_NETWORK,
    SIMULATION_LEVEL_MAP,
} from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import { getDownloadUrl } from '@utils';
import { message } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

import styles from './index.module.scss';

const getJobTags = (job) => {
    const tags = [];
    if (JOB_POST_TYPE_MAP[job.type]) {
        tags.push(JOB_POST_TYPE_MAP[job.type].toUpperCase());
    }
    if (job.roleType && JOB_POST_ROLE_TYPE_MAP[job.roleType]) {
        tags.push(JOB_POST_ROLE_TYPE_MAP[job.roleType].toUpperCase());
    }
    return tags;
};

const getOrgLogo = (job) => {
    const logo =
        job?.educator?.organization?.logoUrl ||
        job?.educator?.profileAccountDto?.avatar ||
        job?.educator?.account?.avatar;
    return logo ? getDownloadUrl(logo) : null;
};

const getPlainTextFromTipTap = (content) => {
    if (!content) return '';
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            const extractText = (node) => {
                if (!node) return '';
                if (node.text) return node.text + ' ';
                if (node.content) return node.content.map(extractText).join('');
                return '';
            };
            return extractText(parsed).trim();
        } catch (e) {
            return content;
        }
    }
    return content;
};

function JobsDesktop() {
    const navigate = useNavigate();
    const [ selectedJobId, setSelectedJobId ] = useState(null);
    const [ selectedTab, setSelectedTab ] = useState('all'); // 'all', 'saved'

    // Dropdown filters
    const [ opportunityFilter, setOpportunityFilter ] = useState('Tất cả');
    const [ roleFilter, setRoleFilter ] = useState('Tất cả');
    const [ selectedProvinceId, setSelectedProvinceId ] = useState(null);
    const [ selectedWardId, setSelectedWardId ] = useState(null);

    // Fetch provinces on mount
    const { data: provinces } = useFetch(apiConfig.nation.client_list, {
        params: { kind: 1, page: 0, size: 200 },
        mappingData: (res) => res.data?.content || [],
        immediate: true,
    });

    // Fetch wards dynamically based on province
    const [ wards, setWards ] = useState([]);
    const { execute: fetchWards } = useFetch(apiConfig.nation.client_list, {
        immediate: false,
    });

    useEffect(() => {
        if (selectedProvinceId) {
            fetchWards({
                params: { kind: 2, parentId: selectedProvinceId, page: 0, size: 200 },
                onCompleted: (res) => {
                    setWards(res?.data?.content || []);
                },
            });
            setSelectedWardId(null);
        } else {
            setWards([]);
            setSelectedWardId(null);
        }
    }, [ selectedProvinceId, fetchWards ]);

    const handleSelectJob = (jobId) => {
        setSelectedJobId(jobId);
    };

    // Mapped query parameters for the main job list
    const queryParams = useMemo(() => {
        const params = {
            page: 0,
            size: 100, // Fetch a reasonably large list since there is no pagination UI
        };

        if (opportunityFilter !== 'Tất cả') params.type = parseInt(opportunityFilter);
        if (selectedProvinceId) params.provinceId = selectedProvinceId;
        if (selectedWardId) params.wardId = selectedWardId;

        return params;
    }, [ opportunityFilter, selectedProvinceId, selectedWardId ]);

    // Fetch saved job IDs on mount
    const { data: savedJobIdsResponse, execute: fetchSavedJobs } = useFetch(apiConfig.job.listSaveJob, {
        mappingData: (res) => res.data?.jobPostIds || [],
        immediate: true,
    });
    const savedJobIds = savedJobIdsResponse || [];
    const savedCount = savedJobIds.length;

    // Main jobs list fetcher
    const {
        data: jobsResponse,
        loading: listLoading,
        execute: fetchJobs,
    } = useFetch(apiConfig.job.guestList, {
        mappingData: (res) => res.data || {},
    });

    // Load jobs on query parameters change
    useEffect(() => {
        fetchJobs({ params: queryParams });
    }, [ queryParams, fetchJobs ]);

    // Active job details resolver
    const jobs = jobsResponse?.content || [];

    // Filter by tab & roleType:
    const filteredJobs = useMemo(() => {
        let list = jobs;
        if (selectedTab === 'saved') {
            list = list.filter((job) => savedJobIds.includes(job.id));
        }

        // Apply client-side role filtering (intersection logic)
        if (roleFilter !== 'Tất cả') {
            const filterAtomSet = new Set(JOB_POST_ROLE_ATOMS[parseInt(roleFilter)] || []);
            list = list.filter((job) => {
                if (!job.roleType) return false;
                const jobAtoms = JOB_POST_ROLE_ATOMS[job.roleType] || [];
                // Check if there is at least one overlapping atom
                return jobAtoms.some((atom) => filterAtomSet.has(atom));
            });
        }

        return list;
    }, [ jobs, selectedTab, savedJobIds, roleFilter ]);

    const activeJob = useMemo(() => {
        return filteredJobs.find((job) => job.id === selectedJobId) || filteredJobs[0] || null;
    }, [ filteredJobs, selectedJobId ]);

    const {
        data: activeJobDetail,
        loading: detailLoading,
        execute: fetchJobDetail,
    } = useFetch(apiConfig.job.guestGet, {
        mappingData: (res) => res.data || null,
        immediate: false,
    });

    useEffect(() => {
        if (activeJob?.id) {
            fetchJobDetail({
                pathParams: { id: activeJob.id },
            });
        }
    }, [ activeJob?.id, fetchJobDetail ]);

    const displayJob = activeJobDetail && activeJobDetail.id === activeJob?.id ? activeJobDetail : activeJob;

    // Reset selected job if it gets filtered out of the list
    useEffect(() => {
        if (selectedJobId && filteredJobs.length > 0 && !filteredJobs.some((j) => j.id === selectedJobId)) {
            setSelectedJobId(null);
        }
    }, [ filteredJobs, selectedJobId ]);

    // Toggle save job action
    const { execute: callSaveJob } = useFetch(apiConfig.job.saveJob, {}, false);
    const handleToggleSaveJob = (e, jobId) => {
        e.stopPropagation();
        const isSaved = savedJobIds.includes(jobId);
        const newSavedIds = isSaved ? savedJobIds.filter((id) => id !== jobId) : [ ...savedJobIds, jobId ];

        callSaveJob({
            dataBody: { jobPostIds: newSavedIds },
            onCompleted: () => {
                fetchSavedJobs(); // Refresh saved jobs list from backend
                message.success(isSaved ? 'Đã bỏ lưu tin tuyển dụng' : 'Đã lưu tin tuyển dụng');
            },
            onError: (err) => {
                message.error(err?.message || 'Không thể cập nhật trạng thái lưu.');
            },
        });
    };

    return (
        <div className={styles.jobsContainer}>
            {/* HERO */}
            <div className={styles.hero}>
                <h1>Cơ hội thực tập, vị trí dành cho người mới bắt đầu sự nghiệp và cơ hội kết nối.</h1>
                <p>
                    Khám phá các cơ hội thực tập, việc làm dành cho sinh viên sắp tốt nghiệp và các sự kiện độc quyền từ
                    các công ty hàng đầu trên ITDream, được thiết kế riêng cho sinh viên đại học và những người mới bắt
                    đầu sự nghiệp.
                </p>
            </div>

            {/* FILTER BAR */}
            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'all' })}
                        onClick={() => {
                            setSelectedTab('all');
                            setSelectedJobId(null);
                        }}
                    >
                        Tất cả
                    </button>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'saved' })}
                        onClick={() => {
                            setSelectedTab('saved');
                            setSelectedJobId(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M9 7h6M9 11h6M9 15h4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Đã lưu ({savedCount})
                    </button>
                </div>

                <div className={styles.filterDropdowns}>
                    <div className={styles.selectWrapper}>
                        <select
                            value={opportunityFilter}
                            onChange={(e) => setOpportunityFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại cơ hội: Tất cả</option>
                            {JOB_POST_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại vai trò: Tất cả</option>
                            {JOB_POST_ROLE_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={selectedProvinceId || 'Tất cả'}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedProvinceId(val === 'Tất cả' ? null : parseInt(val));
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Tỉnh / Thành phố: Tất cả</option>
                            {provinces?.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            disabled={!selectedProvinceId}
                            value={selectedWardId || 'Tất cả'}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedWardId(val === 'Tất cả' ? null : parseInt(val));
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Phường / Xã: Tất cả</option>
                            {wards?.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.resultCount}>
                {listLoading
                    ? 'Đang tải...'
                    : `Hiển thị 1–${filteredJobs.length} trong số ${filteredJobs.length} cơ hội`}
            </div>

            {/* MAIN LAYOUT */}
            <div className={classNames(styles.mainLayout, { [styles.panelOpen]: activeJob !== null })}>
                {/* LEFT: JOB LIST */}
                <div className={styles.jobList}>
                    {listLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', width: '100%' }}>
                            <LoadingComponent />
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className={classNames(styles.jobCard, {
                                    [styles.selected]:
                                        selectedJobId === job.id || (!selectedJobId && activeJob?.id === job.id),
                                    [styles.cardEvent]: job.type === 1,
                                    [styles.cardJob]: job.type === 2,
                                    [styles.cardNetwork]: job.type === 3,
                                })}
                                onClick={() => handleSelectJob(job.id)}
                            >
                                <div className={styles.cardTop}>
                                    <div className={styles.companyNameText}>
                                        {job.educator?.organization?.name ||
                                            job.educator?.profileAccountDto?.fullName ||
                                            'ITDream'}
                                    </div>
                                    <div className={styles.cardTags}>
                                        {getJobTags(job).map((tag, i) => (
                                            <span
                                                key={i}
                                                className={classNames(styles.tag, {
                                                    [styles.tagEvent]: job.type === JOB_POST_TYPE_EVENT,
                                                    [styles.tagJob]: job.type === JOB_POST_TYPE_JOB,
                                                    [styles.tagNetwork]: job.type === JOB_POST_TYPE_TALENT_NETWORK,
                                                    [styles.tagIntern]: [
                                                        JOB_POST_ROLE_TYPE_INTERNSHIP,
                                                        JOB_POST_ROLE_TYPE_INTERNSHIP_PART_TIMES,
                                                        JOB_POST_ROLE_TYPE_INTERNSHIP_FULL_TIMES,
                                                    ].includes(job.roleType),
                                                    [styles.tagPartTime]: [
                                                        JOB_POST_ROLE_TYPE_PART_TIMES,
                                                        JOB_POST_ROLE_TYPE_INTERNSHIP_PART_TIMES,
                                                        JOB_POST_ROLE_TYPE_PART_TIMES_FULL_TIMES,
                                                    ].includes(job.roleType),
                                                    [styles.tagFullTime]: [
                                                        JOB_POST_ROLE_TYPE_FULL_TIMES,
                                                        JOB_POST_ROLE_TYPE_INTERNSHIP_FULL_TIMES,
                                                        JOB_POST_ROLE_TYPE_PART_TIMES_FULL_TIMES,
                                                        JOB_POST_ROLE_TYPE_ALL,
                                                    ].includes(job.roleType),
                                                })}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.cardTitle}>{job.title}</div>
                                {job.content && (
                                    <div className={styles.cardDesc}>
                                        {(() => {
                                            const plainText = getPlainTextFromTipTap(job.content);
                                            return plainText.length > 120
                                                ? plainText.substring(0, 120) + '...'
                                                : plainText;
                                        })()}
                                    </div>
                                )}
                                <div className={styles.cardMeta}>
                                    {(job.address || job.province?.name) && (
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            {job.address?.toLowerCase() === 'online'
                                                ? 'Online'
                                                : job.province?.name || ''}
                                        </span>
                                    )}
                                    {((job.type === 1 && job.date) || (job.type !== 1 && job.endDate)) && (
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                <path
                                                    d="M12 7v5l3 3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            {job.type === 1
                                                ? dayjs.utc(job.date, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')
                                                : `Hạn: ${dayjs.utc(job.endDate, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}`}
                                        </span>
                                    )}
                                    <button
                                        className={classNames(styles.saveBtn, {
                                            [styles.saved]: savedJobIds.includes(job.id),
                                        })}
                                        onClick={(e) => handleToggleSaveJob(e, job.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noJobs}>Không tìm thấy tin tuyển dụng nào phù hợp.</div>
                    )}
                </div>

                {/* RIGHT: DETAIL PANEL */}
                <div className={styles.rightColumn}>
                    {displayJob ? (
                        <div className={classNames(styles.detailPanel, styles.visible)}>
                            <div
                                className={styles.detailHeroImg}
                                style={{
                                    backgroundImage: displayJob.image
                                        ? `url(${getDownloadUrl(displayJob.image)})`
                                        : 'linear-gradient(135deg, #0f2042, #1b3564)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '180px',
                                }}
                            />

                            <div className={styles.detailBody}>
                                <div className={styles.detailTags}>
                                    {getJobTags(displayJob).map((tag, i) => (
                                        <span
                                            key={i}
                                            className={classNames(styles.tag, {
                                                [styles.tagEvent]: tag === 'SỰ KIỆN',
                                                [styles.tagJob]: tag === 'CÔNG VIỆC',
                                                [styles.tagNetwork]: tag === 'MẠNG LƯỚI TÀI NĂNG',
                                                [styles.tagIntern]: tag.includes('THỰC TẬP'),
                                                [styles.tagPartTime]: tag.includes('BÁN THỜI GIAN'),
                                                [styles.tagFullTime]:
                                                    tag.includes('TOÀN THỜI GIAN') || tag === 'TẤT CẢ VAI TRÒ',
                                            })}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.detailTitle}>{displayJob.title}</div>

                                {/* ORGANIZATION & AUTHOR DETAILS */}
                                {displayJob.educator?.organization?.name && (
                                    <div className={styles.authorSection}>
                                        {getOrgLogo(displayJob) && (
                                            <img src={getOrgLogo(displayJob)} alt="logo" className={styles.orgLogo} />
                                        )}
                                        <div className={styles.authorInfo}>
                                            <div className={styles.orgName}>
                                                {displayJob.educator.organization.name}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {((displayJob.type === 1 && displayJob.date) ||
                                    (displayJob.type !== 1 && displayJob.endDate)) && (
                                    <div className={styles.detailMetaRow}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                            <path
                                                d="M12 7v5l3 3"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className={styles.label}>
                                            {displayJob.type === 1 ? 'Ngày tổ chức:' : 'Hạn chót ứng tuyển:'}
                                        </span>{' '}
                                        {displayJob.type === 1
                                            ? dayjs.utc(displayJob.date, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')
                                            : dayjs.utc(displayJob.endDate, 'DD/MM/YYYY HH:mm:ss').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
                                    </div>
                                )}
                                {(displayJob.address || displayJob.province?.name) && (
                                    <div className={styles.detailMetaRow}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <span className={styles.label}>Địa điểm làm việc:</span>{' '}
                                        {displayJob.address?.toLowerCase() === 'online'
                                            ? 'Online'
                                            : `${displayJob.address ? `${displayJob.address}, ` : ''}${displayJob.province?.name || ''}`}
                                    </div>
                                )}

                                <div className={styles.actionBtns}>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => {
                                            if (displayJob.jobUrl) {
                                                window.open(displayJob.jobUrl, '_blank');
                                            } else {
                                                message.warning('Không tìm thấy đường dẫn tuyển dụng.');
                                            }
                                        }}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            style={{ marginRight: 6 }}
                                        >
                                            <path
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        Đăng ký ngay
                                    </button>
                                </div>

                                <div className={styles.detailDescWrapper}>
                                    {detailLoading && !activeJobDetail ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                            <LoadingComponent />
                                        </div>
                                    ) : (
                                        displayJob.content && <TipTapJsonRenderer content={displayJob.content} />
                                    )}
                                </div>

                                {/* SIMULATIONS */}
                                {displayJob.simulations && displayJob.simulations.length > 0 && (
                                    <>
                                        <hr className={styles.divider} />
                                        <div className={styles.detailSectionTitle}>Mô phỏng công việc liên quan</div>
                                        <p className={styles.simulationIntro}>
                                            Hãy tìm hiểu cách thức công việc được thực hiện để nổi bật trong các buổi
                                            phỏng vấn. Cho đội ngũ thấy rằng bạn có những kỹ năng cần thiết để thành
                                            công trong công việc.
                                        </p>

                                        {displayJob.simulations.map((sim) => (
                                            <div
                                                key={sim.id}
                                                className={styles.simCard}
                                                style={{ marginBottom: 12 }}
                                                onClick={() => navigate(`/simulations/${sim.id}`)}
                                            >
                                                <div
                                                    className={styles.simThumb}
                                                    style={{
                                                        backgroundImage: sim.thumbnail
                                                            ? `url(${getDownloadUrl(sim.thumbnail)})`
                                                            : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    }}
                                                >
                                                    {!sim.thumbnail &&
                                                        (sim.category?.name?.substring(0, 7).toUpperCase() || '')}
                                                </div>
                                                <div className={styles.simInfo}>
                                                    <div className={styles.simLabel}>{sim.category?.name || ''}</div>
                                                    <div className={styles.simName}>{sim.title}</div>
                                                    <div className={styles.simMeta}>
                                                        <span>{SIMULATION_LEVEL_MAP[sim.level] || ''}</span>
                                                        <div className={styles.simDots}>
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 1,
                                                                })}
                                                            />
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 2,
                                                                })}
                                                            />
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 3,
                                                                })}
                                                            />
                                                        </div>
                                                        <span>{sim.duration || '2-3 giờ'}</span>
                                                    </div>
                                                    {(sim.totalParticipant !== undefined ||
                                                        (sim.avgStar !== undefined && sim.avgStar > 0)) && (
                                                        <div className={styles.simExtraMeta}>
                                                            {sim.totalParticipant !== undefined && (
                                                                <span>👤 {sim.totalParticipant} học viên</span>
                                                            )}
                                                            {sim.avgStar !== undefined && sim.avgStar > 0 && (
                                                                <span>⭐ {sim.avgStar} / 5</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.upsellPanel}>
                            <h3>Tăng cơ hội tuyển dụng của bạn</h3>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Hoàn thành bài mô phỏng công việc liên kết để nhận huy hiệu ưu tiên nộp đơn.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Chia sẻ thành tích trực tiếp với đội ngũ tuyển dụng của doanh nghiệp đối tác.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>Tạo ấn tượng sâu sắc hơn thông qua các kỹ năng thực tế đã được kiểm chứng.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobsDesktop;
