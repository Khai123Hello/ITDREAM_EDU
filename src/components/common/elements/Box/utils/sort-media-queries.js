function replaceMediaQuery(query) {
    return query.replace('(max-width: ', '').replace('px)', '');
}

export function sortMediaQueries({ media, ...props }) {
    const breakpoints = Object.keys(media);
    const sortedMedia = breakpoints
        .sort((a, b) => Number(replaceMediaQuery(a)) - Number(replaceMediaQuery(b)))
        .map((query) => ({ query, styles: media[query] }));

    return { ...props, media: sortedMedia };
}
