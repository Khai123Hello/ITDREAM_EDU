import React from 'react';
import ConfirmModalWrapper from '@components/common/elements/ConfirmModalWrapper';
import Tooltip from '@components/common/elements/Tooltip';
import Loading from '@components/common/loading';
import ErrorBoundary from '@components/common/page/ErrorBoundary';
import AppLoading from '@modules/layout/common/AppLoading';
import AppRoutes from '@routes/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const App = () => {
    const queryClient = new QueryClient();
    return (
        <React.Suspense fallback={<Loading show />}>
            <QueryClientProvider client={queryClient}>
                <ConfirmModalWrapper>
                    <Tooltip.Provider>
                        <ErrorBoundary>
                            <AppLoading />
                            <AppRoutes />
                            <Toaster richColors closeButton position="top-center" duration={800} />
                        </ErrorBoundary>
                    </Tooltip.Provider>
                </ConfirmModalWrapper>
            </QueryClientProvider>
        </React.Suspense>
    );
};

export default App;
