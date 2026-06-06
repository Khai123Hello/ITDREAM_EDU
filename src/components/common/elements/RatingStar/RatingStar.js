import React from 'react';
import { Rating, Star } from '@smastrom/react-rating';

import '@smastrom/react-rating/style.css';
function RatingStar({
    value,
    itemShapes = Star,
    activeFillColor = '#f59e0b',
    inactiveFillColor = '#ffedd5',
    ...props
}) {
    const styles = {
        itemShapes: itemShapes,
        activeFillColor: activeFillColor,
        inactiveFillColor: inactiveFillColor,
    };
    return <Rating value={value} itemStyles={styles} {...props} />;
}

export default RatingStar;
