import { useState } from "react";

export default function StateBasic({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useState(initialCount);
    const handleClick = () => setCount(count + 1);

    return (
        <>
            <button onClick={handleClick}>カウント</button>
            <p>{count}回クリックされました。</p>
        </>
    )
}
