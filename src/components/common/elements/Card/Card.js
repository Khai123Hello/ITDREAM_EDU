import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from './index.module.scss';

const Card = ({ children, className }) => {
    return <div className={classNames(styles.card, className)}>{children}</div>;
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Card;
