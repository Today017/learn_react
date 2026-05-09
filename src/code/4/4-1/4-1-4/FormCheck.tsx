import { useState, type ChangeEvent } from "react";

type FormState = {
    agreement: boolean
};

export default function FormCheck() {
    const [form, setForm] = useState<FormState>({
        agreement: true
    });

    const handleFormCheck = (event: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.checked
        });
    };

    const show = () => {
        alert(`State: ${form.agreement ? 'Agree' : 'Disagree'}`);
    };

    return (
        <form>
            <label htmlFor="agreement">Agree:</label>
            <input
                id="agreement"
                name="agreement"
                type="checkbox"
                checked={form.agreement}
                onChange={handleFormCheck}
            /><br />

            <button type="button" onClick={show}>Show</button>
        </form>
    );
}