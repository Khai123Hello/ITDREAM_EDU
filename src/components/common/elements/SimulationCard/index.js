import React from 'react';
import { SIMULATION_LEVEL_MAP } from '@constants';
import { getDownloadUrl } from '@utils';

import styles from './index.module.scss';

const levelConfig = {
    1: { label: SIMULATION_LEVEL_MAP[1], className: 'badgeBasic' },
    2: { label: SIMULATION_LEVEL_MAP[2], className: 'badgeMid' },
    3: { label: SIMULATION_LEVEL_MAP[3], className: 'badgeAdv' },
};

const thumbGradients = [
    [ '#dbeafe', '#bfdbfe' ],
    [ '#dcfce7', '#bbf7d0' ],
    [ '#fef9c3', '#fde68a' ],
    [ '#fce7f3', '#fbcfe8' ],
    [ '#ede9fe', '#ddd6fe' ],
    [ '#cffafe', '#a5f3fc' ],
    [ '#ffedd5', '#fed7aa' ],
    [ '#f1f5f9', '#e2e8f0' ],
];

const SimulationCard = ({
    id,
    title,
    thumbnail,
    level = 1,
    duration,
    totalParticipant,
    avgStar,
    organization = {},
    category,
    onClick,
}) => {
    const lvl = levelConfig[level] || levelConfig[1];
    const gradientIndex = (id || Math.random()).toString().length % thumbGradients.length;
    const [ gStart, gEnd ] = thumbGradients[gradientIndex];

    const orgName = organization.shortName || organization.name || '';
    const orgInitial = orgName ? orgName.charAt(0).toUpperCase() : '?';

    const formatStar = (star) => {
        if (star == null) return null;
        return star.toFixed(1);
    };

    return (
        <div
            className={styles.card}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            aria-label={title}
        >
            <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${gStart} 0%, ${gEnd} 100%)` }}>
                {thumbnail && <img src={getDownloadUrl(thumbnail)} alt={title} className={styles.thumbImg} />}
                <span className={`${styles.thumbBadge} ${styles[lvl.className]}`}>{lvl.label}</span>
            </div>

            <div className={styles.orgBar}>
                {organization.logoUrl ? (
                    <img src={getDownloadUrl(organization.logoUrl)} alt={orgName} className={styles.orgLogo} />
                ) : (
                    <div className={styles.orgLogoFallback}>{orgInitial}</div>
                )}
                <span className={styles.orgName}>{organization.name || orgName}</span>
            </div>

            <div className={styles.body}>
                <p className={styles.title}>{title}</p>

                <div className={styles.meta}>
                    {category && (
                        <span className={styles.metaItem}>
                            <svg
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                            {category}
                        </span>
                    )}
                    <span className={styles.metaItem}>
                        <span className={styles.levelDots}>
                            {[ 1, 2, 3 ].map((i) => (
                                <span
                                    key={i}
                                    className={`${styles.dot} ${i <= level ? styles.dotFilled : styles.dotEmpty}`}
                                />
                            ))}
                        </span>
                        {lvl.label}
                    </span>
                    {duration && (
                        <span className={styles.metaItem}>
                            <svg
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {duration}
                        </span>
                    )}
                </div>

                <div className={styles.footer}>
                    {avgStar != null && (
                        <div className={styles.starRow}>
                            ★ {formatStar(avgStar)}
                            {totalParticipant != null && (
                                <span>
                                    (
                                    {totalParticipant > 999
                                        ? `${(totalParticipant / 1000).toFixed(1)}k`
                                        : totalParticipant}
                                    )
                                </span>
                            )}
                        </div>
                    )}
                    {category && <span className={styles.catTag}>{category}</span>}
                </div>
            </div>
        </div>
    );
};

export default SimulationCard;
