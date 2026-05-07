import { useRef } from "react";

export default function StateForm() {
    // 要素への参照を保持するRefオブジェクトを生成
    const name = useRef(null);
    const age = useRef(null);

    const show = () => {
        alert(`name: ${name.current.value}, age: ${age.current.value}`);
    };

    return (
        <form>
            <div>
                <label htmlFor="name">Name: </label>
                <input id="name" name="name" type="text"
                    ref={name} defaultValue="soma" />
                    {/* ref={name} でRefオブジェクトに<input>要素を紐付け */}
            </div>
            <div>
                <label htmlFor="age">Age: </label>
                <input id="age" name="age" type="number"
                    ref={age} defaultValue={20} />
            </div>
            <div>
                <button type="button" onClick={show}>Show</button>
            </div>
        </form>
    );
}