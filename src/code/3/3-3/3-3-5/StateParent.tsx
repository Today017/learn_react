import { useState } from "react";
import StateCounter from "./StateCounter.tsx";
import StateCounter2 from "./StateCounter2.tsx";

export default function StateParent() {
    const [count, setCount] = useState(0);

    // このコンポーネントの count を
    // 子どもの StateCounter から更新するための関数
    const update = step => setCount(prevCount => prevCount + step);

    const _update = (step: number) => {
        // 子供ごとに step が異なることに対応
        setCount((prevCount) => {
            return prevCount + step;
        });
        return;
    };

    return (
        <>
            <p>Count: {count}</p>
            <StateCounter step={1} onUpdate={update} />
            <StateCounter step={5} onUpdate={_update} />
            <StateCounter step={-1} onUpdate={update} />

            <StateCounter2 count={count} setCount={setCount} />
        </>
    );
}