import { Fragment } from "react/jsx-runtime";
import type { ReactNode } from 'react';

type Props = {
    messages: string[];
    children: (elem: string) => ReactNode;
};

export default function ListTemplate({ messages, children }: Props) {
    return (
        <dl>
            {
                messages.map(elem => (
                    <Fragment key={elem}>
                        {children(elem)}
                    </Fragment>
                ))
            }
        </dl>
    )
}