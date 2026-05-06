import React from 'react'

export default function EventObj() {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        console.log(event);
    };

    return (
        <button onClick={handleClick}>
            Click me!
        </button>
    );
}

// React.MouseEvent<HTMLButtonElement>

// React.MouseEvent はクリック・ホバー・ドラッグなどのマウス操作に関するReact専用のイベントオブジェクトの型
// これにより event.clientX や event.shiftKey などのマウスイベント特有のプロパティにアクセスできるようになる

// <HTMLButtonElement> は、イベントが発生する要素がHTMLの<button>であることを示す型引数
// これにより、イベントオブジェクトの target プロパティが HTMLButtonElement 型であることが保証され、
// button要素特有のプロパティやメソッドにアクセスできるようになる。

// 他にも <HTMLDivElement>(div要素) や <HTMLInputElement>(input要素) などがある。