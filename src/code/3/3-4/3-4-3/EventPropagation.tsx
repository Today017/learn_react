import React from 'react'

export default function EventPropagation() {
    const handleParent = () => alert('#parent run...');
    const handleMy = (event: React.MouseEvent<HTMLDivElement>) => {
        // event.stopPropagation();
        // event.preventDefault();
        alert('#my run...');
    }
    const handleChild = () => alert('#child run...');

    return (
        <div id="parent" onClick={handleParent} style={{ padding: '20px', backgroundColor: '#ff0000ff' }}>
            Parent
            <div id="my" onClick={handleMy} style={{ padding: '20px', backgroundColor: '#4400ffff' }}>
                My
                <a id="child" onClick={handleChild} href="https://x.com" style={{ padding: '20px', backgroundColor: '#1aff00ff' }}>
                    Child
                </a>
            </div>
        </div>
    )
}