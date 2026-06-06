import React from 'react';
import DefaultLayout from '@modules/layout/common/DefaultLayout';

import PageNotFound from '../page/PageNotFound';

const RenderContext = ({ layout, components, layoutProps, ...props }) => {
    const ComponentLayout = layout?.defaultTheme || DefaultLayout;
    const ComponentRender = components?.desktop?.defaultTheme || PageNotFound;
    return (
        <ComponentLayout layoutProps={layoutProps}>
            <ComponentRender {...props} />
        </ComponentLayout>
    );
};

export default RenderContext;
