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

export default function StateNestImmer2() {
    const [form, setForm] = useImmer<FormState>({
        name: 'Today',
        address: {
            prefecture: 'Hokkaido',
            city: 'Sapporo',
        }
    });

    const handleNest=(event: ChangeEvent<HTMLInputElement>)=>{
        const ns=event.target.name.split('.');
        setForm(form=>{
            if(ns.length===1){
                form[ns[0]]=event.target.value;
            }else{
                form[ns[0]][ns[1]]=event.target.value;
            }
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
                    onChange={handleNest}
                    value={form.name}
                />
            </div>
            <div>
                <label htmlFor="prefecture">Address/Prefecture:</label>
                <input
                    id="prefecture"
                    name="address.prefecture"
                    type="text"
                    onChange={handleNest}
                    value={form.address.prefecture}
                />
            </div>
            <div>
                <label htmlFor="city">Address/City:</label>
                <input
                    id="city"
                    name="address.city"
                    type="text"
                    onChange={handleNest}
                    value={form.address.city}
                />
            </div>
            <div>
                <button type="button" onClick={show}>Show</button>
            </div>
        </form>
    );
}