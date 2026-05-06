import React from 'react'

export default function EventKey() {
    const handleKey = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.ctrlKey && event.key === 'q') {
            alert('Ctrl + Q was pressed!');
            alert('Name is required to be more than 5 characters.');
        }
    };

    return (
        <form>
            <label>
                Enter your name:
                <input type="text" onKeyDown={handleKey} />
            </label>
        </form>
    );
}