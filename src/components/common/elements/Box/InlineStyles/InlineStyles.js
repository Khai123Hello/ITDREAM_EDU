import React from 'react';

import { stylesToString } from './utils';

export function InlineStyles({ selector, styles, media }) {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: stylesToString({ selector, styles, media }),
            }}
        />
    );
}
