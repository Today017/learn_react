import React from 'react'

export default function EventArgs() {
    const current = (event: React.MouseEvent<HTMLButtonElement>, type: string): void => {
        const d = new Date();

        switch (type) {
            case 'date':
                alert(`${event.target}: ${d.toLocaleDateString()}`);
                break;
            case 'time':
                alert(`${event.target}: ${d.toLocaleTimeString()}`);
                break;
            default:
                alert(`${event.target}: ${d.toLocaleString()}`);
                break;
        }
    };

    return (
        <>
            <button onClick={(e) => current(e, 'datetime')}>Show Date & Time</button>
            <button onClick={(e) => current(e, 'date')}>Show Date</button>
            <button onClick={(e) => current(e, 'time')}>Show Time</button>
        </>
    );
}