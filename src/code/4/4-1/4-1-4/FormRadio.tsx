import { useState, type ChangeEvent } from "react";

type FormState = {
    os: string;
};

export default function FormRadio() {
    const [form, setForm] = useState<FormState>({
        os: 'windows'
    });

    const handleForm = (event: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const show = () => {
        alert(`OS: ${form.os}`);
    };

    return (
        <form>
            <fieldset>
                <legend>OS:</legend>

                {/* Windows */}
                <label htmlFor="os_win">Windows</label>
                <input
                    id="os_win"
                    name="os"
                    type="radio"
                    value="windows"
                    checked={form.os === 'windows'}
                    onChange={handleForm}
                /><br />

                {/* macOS */}
                <label htmlFor="os_mac">Mac</label>
                <input
                    id="os_mac"
                    name="os"
                    type="radio"
                    value="mac"
                    checked={form.os === 'mac'}
                    onChange={handleForm}
                /><br />

                {/* Linux */}
                <label htmlFor="os_lin">Linix</label>
                <input
                    id="os_lin"
                    name="os"
                    type="radio"
                    value="linux"
                    checked={form.os === 'linux'}
                    onChange={handleForm}
                /><br />
            </fieldset>

            <button type="button" onClick={show}>Show</button>
        </form>
    );
}