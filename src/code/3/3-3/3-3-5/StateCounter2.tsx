type Props = {
    count: number;
    setCount: (newCount: number) => void;
};

export default function StateCounter2({ count, setCount }: Props) {
    const handleClick = () => setCount(count + 1);

    return (
        <button onClick={handleClick}>
            <span>+1 (fixed)</span>
        </button>
    );
}