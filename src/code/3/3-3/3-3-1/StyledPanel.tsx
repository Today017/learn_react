import type { ReactElement } from 'react';

type Props = {
    children: ReactElement[]; // 1つ以上のReact要素を受け取る
};

export default function StyledPanel({ children }: Props) {
    return (
        <div
            style={{
                border: '1px solid #ccc',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
            }}
        >
            {children}
        </div>
    );
}

/*
呼び出し元:
<StyledPanel>
    <p>この内容はパネル内に表示されます。</p>
</StyledPanel>

この場合、<p>要素はStyledPanelコンポーネントの子要素となり、
childrenを通じてアクセスできる。

実体は配下のコンテンツを表す React 要素の配列だが、
そのまま出力するだけであれば特に意識する必要はない。（{children} で処理可能）
*/

