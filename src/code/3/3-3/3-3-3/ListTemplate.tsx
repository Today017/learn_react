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

// ListTemplate の呼び出し元の配下の子要素を「テンプレートを返す関数」とする。
// children ではなく　Props の属性としてもOK