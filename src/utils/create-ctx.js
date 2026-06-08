import React from 'react';

export default function createCtx(componentName, defaultContext) {
    const Context = React.createContext();

    function Provider({ children, ...context }) {
        const value = React.useMemo(() => context, Object.values(context));
        return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useContext() {
        const context = React.useContext(Context);
        if (context) return context;
        if (defaultContext !== undefined) return defaultContext;

        throw new Error(`use${componentName}Context must be used within a ${componentName}Provider`);
    }

    return [Provider, useContext];
}
