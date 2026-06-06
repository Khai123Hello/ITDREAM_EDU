import React from 'react';

function Divider({ color = '#e1e1e2', thickness = '1px', margin = '0px' }) {
    return (
        <div
            style={{
                width: '100%',
                height: thickness,
                backgroundColor: color,
                margin: margin,
            }}
        />
    );
}

export default Divider;
