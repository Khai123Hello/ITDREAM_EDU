import React from 'react';
import useDevices from '@hooks/useDevices';

const RenderContextLayout = ({ layouts, children }) => {
    const { isMobile } = useDevices();
    const LayoutRender = (isMobile ? layouts?.mobile?.defaultTheme : layouts?.desktop?.defaultTheme) || <div></div>;

    return <LayoutRender>{children}</LayoutRender>;
};

export default RenderContextLayout;
