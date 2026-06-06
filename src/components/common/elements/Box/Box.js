import React, { forwardRef, useId } from 'react';
import { extractStyleProps } from '@utils/extract-style-props';
import classNames from 'classnames';

import { getBoxStyle } from './utils/get-box-style';
import { parseStyleProps } from './utils/parse-style-props';
import { STYlE_PROPS_DATA } from './utils/style-props-data';
import InlineStyles from './InlineStyles';

export function useRandomClassName() {
    const id = useId().replace(/:/g, '');
    return `__duc_${id}`;
}

const Box = forwardRef(({ component, style, className, renderRoot, ...others }, ref) => {
    const Element = component || 'div';
    const { styleProps, rest } = extractStyleProps(others);
    const responsiveClassName = useRandomClassName();
    const parsedStyleProps = parseStyleProps({
        styleProps,
        data: STYlE_PROPS_DATA,
    });

    const props = {
        ref,
        style: getBoxStyle({
            style,
            styleProps: parsedStyleProps.inlineStyles,
        }),
        className: classNames(className, {
            [responsiveClassName]: parsedStyleProps.hasResponsiveStyles,
        }),
        ...rest,
    };

    return (
        <>
            {parsedStyleProps.hasResponsiveStyles && (
                <InlineStyles
                    selector={`.${responsiveClassName}`}
                    styles={parsedStyleProps.styles}
                    media={parsedStyleProps.media}
                />
            )}

            {typeof renderRoot === 'function' ? renderRoot(props) : <Element {...props} />}
        </>
    );
});

Box.displayName = 'Box';

export default Box;
