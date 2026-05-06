import { useState } from 'react'

type Props = {
    defaultMessage: string;
    afterMessage: string;
}

export default function EventMouse({ defaultMessage, afterMessage }: Props) {
    const [current, setCurrent] = useState(defaultMessage);
    const handleEnter = () => setCurrent(afterMessage);
    const handleLeave = () => setCurrent(defaultMessage);

    return (
        <>
            <p>{current}</p>
            <button onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
                Hover me!
            </button>
        </>
    );
}
