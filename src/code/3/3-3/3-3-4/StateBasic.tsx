import { useState } from "react";

export default function StateBasic({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useState(initialCount);
    const handleClick = () => {
        // 1回のクリックで count を 2 増やしたい場合

        // これは期待通り動作しない
        // setCount(count + 1);
        // setCount(count + 1);

        // これは期待通り動作する
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);

        // これは期待通り動作する
        function updateCount(prevCount: number) {
            return prevCount + 1;
        }
        setCount(updateCount);
        setCount(updateCount);

        // これは期待通り動作する
        const func = (prevCount: number) => prevCount + 1;
        setCount(func);
        setCount(func);
    };

    return (
        <>
            <button onClick={handleClick}>Count</button>
            <p>{count} times clicked!</p>
        </>
    );
}
