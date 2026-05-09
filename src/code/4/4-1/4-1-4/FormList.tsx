import { useState, type ChangeEvent } from "react";

interface FormState {
    animal: string[]
}

export default function FormList() {
    const [form, setForm] = useState<FormState>({
        animal: ['dog', 'hamster']
    });

    const handleFormList = (event: ChangeEvent<HTMLSelectElement>) => {
        const data: string[] = [];

        const opts = event.target.options;
        for (let i = 0; i < opts.length; i++) {
            const opt = opts[i];
            if (opt.selected) {
                data.push(opt.value);
            }
        }

        setForm({
            ...form,
            [event.target.name]: data
        });
    };

    const show = () => {
        alert(`Animal: ${form.animal.join(', ')}`);
    };

    return (
        <form>
            <label htmlFor="animal">Animal: </label><br />
            <select
                id="animal"
                name="animal"
                value={form.animal}
                size={4}
                multiple={true}
                onChange={handleFormList}
            >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="hamster">Hamster</option>
                <option value="rabbit">Rabbit</option>
            </select>
            <button type="button" onClick={show}>Show</button>
        </form>
    );
}