const { when } = require('@craco/craco');
const path = require(`path`);
const BabelRcPlugin = require('@jackwilsdon/craco-use-babelrc');
const fs = require('fs');

// Create alias for all file, folder inside src (level 1)
const SRC = `./src`;
const files = fs.readdirSync(path.join(__dirname, SRC));
const resolvedAliases = files.reduce(
    (rs, cur) => ({
        ...rs,
        [`@${cur}`]: path.resolve(__dirname, `${SRC}/${cur}`),
    }),
    {},
);

module.exports = {
    style: {
        css: {
            loaderOptions: {
                modules: {
                    auto: true,
                    exportLocalsConvention: 'camelCase',
                },
            },
        },
        modules: {
            ...when(
                process.env.REACT_APP_ENV !== 'dev',
                () => ({ localIdentName: '[hash:base64:5]' }),
                () => ({}),
            ),
        },
    },
    plugins: [
        {
            plugin: BabelRcPlugin,
        },
    ],
    webpack: {
        alias: resolvedAliases,
    },
    jest: {
        configure: (jestConfig) => {
            const jestAliases = Object.keys(resolvedAliases).reduce((acc, key) => {
                const folder = key.slice(1); // remove '@'
                acc[`^${key}/(.*)$`] = `<rootDir>/src/${folder}/$1`;
                acc[`^${key}$`] = `<rootDir>/src/${folder}`;
                return acc;
            }, {});
            jestConfig.moduleNameMapper = {
                ...jestConfig.moduleNameMapper,
                ...jestAliases,
                '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
            };
            return jestConfig;
        },
    },
};
