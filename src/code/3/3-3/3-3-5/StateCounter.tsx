type Props = {
    step: number;
    onUpdate: (newCount: number) => void;
};

export default function StateCounter({ step, onUpdate }: Props) {
    const handleClick = () => onUpdate(step);

    return (
        <button onClick={handleClick}>
            <span>+{step}</span>
        </button>
    );
}