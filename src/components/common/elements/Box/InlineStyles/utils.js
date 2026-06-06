function camelToKebabCase(value) {
    return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function cssObjectToString(css) {
    return Object.keys(css)
        .reduce((acc, rule) => (css[rule] !== undefined ? `${acc}${camelToKebabCase(rule)}:${css[rule]};` : acc), '')
        .trim();
}

export function stylesToString({ selector, styles, media }) {
    const baseStyles = styles ? cssObjectToString(styles) : '';
    const mediaQueryStyles = !Array.isArray(media)
        ? []
        : media.map((item) => `@media${item.query}{${selector}{${cssObjectToString(item.styles)}}}`);
    return `${baseStyles ? `${selector}{${baseStyles}}` : ''}${mediaQueryStyles.join('')}`.trim();
}
