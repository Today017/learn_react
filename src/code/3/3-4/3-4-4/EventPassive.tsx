import React, { useEffect, useRef } from 'react'

export default function EventPassive() {
    const handleWheel = (event: WheelEvent): void => {
        event.preventDefault();
    };

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const div = divRef.current;
        div?.addEventListener('wheel', handleWheel, { passive: false });
        return (() => {
            div?.removeEventListener('wheel', handleWheel);
        });
    }, []);

    return (
        // <div onWheel={handleWheel} style={{ width: '200px', height: '200px', backgroundColor: '#00ff00ff', overflow: 'scroll' }}>
        <div ref={divRef} style={{ width: '200px', height: '200px', backgroundColor: '#00ff00ff', overflow: 'scroll' }}>
            Scroll me!
        </div>
    );
}