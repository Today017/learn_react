import { useState } from "react";

export default function FormTextarea() {
    const [form, setForm] = useState({
        comment: `Initial Message`
    });

    const handleForm = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const show = ()=> {
        alert(`comment: ${form.comment}`);
    };

    return (
        <form>
            <label htmlFor="comment">Comment:</label><br />
            <textarea id="comment" name="comment"
                cols={30} rows={10}
                value={form.comment}
                onChange={handleForm}
            ></textarea><br />

            <button type="button" onClick={show}>Show</button>
        </form>
    );
}