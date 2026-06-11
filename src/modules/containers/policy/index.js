import React from 'react';
import RenderContext from '@components/common/elements/RenderContext';
import PolicyDesktop from '@modules/layout/desktop/policy';

const PolicyContainer = () => {
    return (
        <RenderContext
            components={{
                desktop: {
                    defaultTheme: PolicyDesktop,
                },
            }}
        />
    );
};

export default PolicyContainer;
