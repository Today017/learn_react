import { useState } from "react";

export default function EventOnce() {
    const [clicked, setClicked] = useState(false);
    const [result, setResult] = useState(0);
    const handleClick = () => {
        if (!clicked) {
            setResult(Math.floor(Math.random() * 100 + 1));
            setClicked(true);
        }
    };

    return (
        <><button onClick={handleClick}>Click me</button>
            <p>Result: {result}</p>
        </>
    );
}