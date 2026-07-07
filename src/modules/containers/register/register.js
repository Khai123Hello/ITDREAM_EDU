import React from 'react';
import RenderContext from '@components/common/elements/RenderContext';
import RegisterDesktop from '@modules/layout/desktop/register';
import { useForm } from 'rc-field-form';

const RegisterContainer = () => {
    const [form] = useForm();

    const layout = {
        defaultTheme: () => <RegisterDesktop form={form} />,
    };

    return (
        <RenderContext
            components={{
                desktop: {
                    defaultTheme: RegisterDesktop,
                },
            }}
            layout={layout}
        />
    );
};

export default RegisterContainer;
