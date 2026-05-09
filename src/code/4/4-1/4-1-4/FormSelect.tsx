import { useState } from "react";

export default function FormSelect() {
    const [form, setForm] = useState({
        animal: 'dog'
    });

    const handleForm = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        })
    };

    const show = () => {
        alert(`Animal: ${form.animal}`);
    };

    return (
        <form>
            <label htmlFor="animal">Animal:</label>
            <select id="animal" name="animal"
                value={form.animal}
                onChange={handleForm}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="hamster">Hamster</option>
                <option value="rabbit">Rabbit</option>
            </select>
            <button type="button" onClick={show}>Show</button>
        </form>
    );
}