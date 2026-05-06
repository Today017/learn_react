import { useState } from 'react'

export default function EventPoint() {
    const [screen, setScreen] = useState({ x: 0, y: 0 })
    const [page, setPage] = useState({ x: 0, y: 0 })
    const [client, setClient] = useState({ x: 0, y: 0 })
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const handleMousemove = (event: React.MouseEvent<HTMLDivElement>) => {
        setScreen({ x: event.screenX, y: event.screenY })
        setPage({ x: event.pageX, y: event.pageY })
        setClient({ x: event.clientX, y: event.clientY })
        setOffset({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY })
    };

    return (
        <div onMouseMove={handleMousemove} style={{ height: '200px', border: '1px solid black' }}>
            <p>Screen: {JSON.stringify(screen)}</p>
            <p>Page: {JSON.stringify(page)}</p>
            <p>Client: {JSON.stringify(client)}</p>
            <p>Offset: {JSON.stringify(offset)}</p>
        </div>
    );
}