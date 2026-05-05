import type { ReactElement } from "react"

export default function TitledPanel({ children }: { children: ReactElement[] }) {
    const title = children.find(elem => elem.key === 'title');
    const contents = children.filter(elem => elem.key !== 'title');

    return (
        <div style={{
            border: '1px solid #ccc',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
        }}>
            {title}
            <hr />
            {contents}
        </div>
    );
}