import { useImmer } from "use-immer";
import { type ChangeEvent } from "react";

type AddressState = {
    prefecture: string,
    city: string
}

type FormState = {
    name: string,
    address: AddressState,
}

export default function StateNestImmer() {
    const [form, setForm] = useImmer<FormState>({
        name: 'Today',
        address: {
            prefecture: 'Hokkaido',
            city: 'Sapporo',
        }
    });

    const handleForm = (event: ChangeEvent<HTMLInputElement>) => {
        setForm(form => {
            form[event.target.name] = event.target.value;
        });
    };

    const handleFormNest = (event: ChangeEvent<HTMLInputElement>) => {
        setForm(form => {
            form.address[event.target.name] = event.target.value;
        });
    };

    const show = () => {
        alert(`${form.name} (${form.address.prefecture} / ${form.address.city})`);
    };

    return (
        <form>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    onChange={handleForm}
                    value={form.name}
                />
            </div>
            <div>
                <label htmlFor="prefecture">Address/Prefecture:</label>
                <input
                    id="prefecture"
                    name="prefecture"
                    type="text"
                    onChange={handleFormNest}
                    value={form.address.prefecture}
                />
            </div>
            <div>
                <label htmlFor="city">Address/City:</label>
                <input
                    id="city"
                    name="city"
                    type="text"
                    onChange={handleFormNest}
                    value={form.address.city}
                />
            </div>
            <div>
                <button type="button" onClick={show}>Show</button>
            </div>
        </form>
    );
}