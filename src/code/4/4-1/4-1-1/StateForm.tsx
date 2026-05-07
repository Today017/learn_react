import { useId, useState } from "react";

export default function StateForm() {
    const id = useId();

    // フォームに関わる値は一つのオブジェクトにまとめる
    // フォーム要素のname属性とState上のプロパティ名は一致させる
    const [form, setForm]=useState({
        name: 'soma',
        age: 20,
    });

    const handleForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });

        // [event.target.name]: event.target.value,
        // 算出プロパティ名
        // 要素の名前（event.target.name）をそのままプロパティ名として、入力値（event.target.value）を渡せ

        // ...form : formオブジェクトのプロパティを展開して渡す

        // 以下と等価
        // setForm({
        //     name: form.name,
        //     age: form.age,
        //     [event.target.name]: event.target.value,
        // });
    };

    const show = () => {
        alert(`name: ${form.name}, age: ${form.age}`);
    };

    return (
        <form>
            <div>
                <label htmlFor={`${id}-name`}>Name: </label>
                <input id={`${id}-name`} name="name" type="text"
                    onChange={handleForm} value={form.name} />
            </div>
            <div>
                <label htmlFor={`${id}-age`}>Age: </label>
                <input id={`${id}-age`} name="age" type="number"
                    onChange={handleForm} value={form.age} />
            </div>
            <div>
                <button type="button" onClick={show}>Show</button>
            </div>
            <p>name: {form.name}, age: {form.age}</p>
        </form>
    );
}