import { useState, type ChangeEvent } from "react";

type FormState = {
    animal: string[];
};

export default function FormCheckMulti() {
    const [form, setForm] = useState<FormState>({
        animal: ['dog', 'hamster']
    });

    const handleFormCheckMulti = (event: ChangeEvent<HTMLInputElement>) => {
        const fa = [...form.animal];

        if (event.target.checked) {
            fa.push(event.target.value);
        } else {
            const index = fa.indexOf(event.target.value);
            if (index > -1) {
                fa.splice(index, 1);
            }
        }

        setForm({
            ...form,
            [event.target.name]: fa
        });
    };

    const show = () => {
        alert(`Animal: ${form.animal.join(', ')}`);
    };

    return (
        <form>
            <fieldset>
                <legend>好きな動物：</legend>

                {/* イヌ */}
                <label htmlFor="animal_dog">Dog</label>
                <input
                    id="animal_dog"
                    name="animal"
                    type="checkbox"
                    value="dog"
                    checked={form.animal.includes('dog')}
                    onChange={handleFormCheckMulti}
                /><br />

                <label htmlFor="animal_cat">Cat</label>
                <input
                    id="animal_cat"
                    name="animal"
                    type="checkbox"
                    value="cat"
                    checked={form.animal.includes('cat')}
                    onChange={handleFormCheckMulti}
                /><br />

                <label htmlFor="animal_hamster">Hamster</label>
                <input
                    id="animal_hamster"
                    name="animal"
                    type="checkbox"
                    value="hamster"
                    checked={form.animal.includes('hamster')}
                    onChange={handleFormCheckMulti}
                /><br />

                <label htmlFor="animal_rabbit">Rabbit</label>
                <input
                    id="animal_rabbit"
                    name="animal"
                    type="checkbox"
                    value="hamster"
                    checked={form.animal.includes('rabbit')}
                    onChange={handleFormCheckMulti}
                /><br />
            </fieldset>

            <button type="button" onClick={show}>Show</button>
        </form>
    );
}