import { useRef } from "react";

export default function FormFile() {
    const file = useRef<HTMLInputElement>(null);

    const show = () => {
        const fs = file.current?.files;

        if (!fs || fs.length == 0) {
            console.log('No file is selected');
            return;
        }

        for (const f of Array.from(fs)) {
            alert(`Name: ${f.name}\nType: ${f.type}\nSize: ${Math.trunc(f.size / 1024)}KB`);
        }
    };

    return (
        <form>
            <input type="file" ref={file} multiple />
            <button type="button" onClick={show}>Show</button>
        </form>
    );
}