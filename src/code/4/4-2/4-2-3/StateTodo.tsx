import { useState, type ChangeEvent, type MouseEvent } from "react";
import './StateTodo.css'

type Todo = {
    id: number,
    title: string,
    created: Date,
    isDone: boolean,
}

export default function StateTodo() {
    const [maxId, setMaxId] = useState<number>(1);
    const [title, setTitle] = useState<string>('');
    const [todo, setTodo] = useState<Todo[]>([]);
    const [desc, setDesc] = useState<boolean>(true);

    const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleClick = () => {
        setTodo([
            ...todo,
            {
                id: maxId,
                title: title,
                created: new Date(),
                isDone: false,
            },
        ]);
        setMaxId(id => id + 1);
    };

    const handleDone = (event: MouseEvent<HTMLButtonElement>) => {
        const targetId = Number(event.currentTarget.dataset.id);

        setTodo(todo.map(item => {
            if (item.id === targetId) {
                return {
                    ...item,
                    isDone: !item.isDone,
                };
            } else {
                return item;
            }
        }));
    };

    const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
        setTodo(todo.filter(item =>
            item.id !== Number(event.currentTarget.dataset.id)
        ));
    };

    const handleSort = () => {
        const sorted = [...todo];
        sorted.sort((m, n) => {
            if (desc) {
                return n.created.getTime() - m.created.getTime();
            } else {
                return m.created.getTime() - n.created.getTime();
            }
        });
        setDesc(d => !d);
        setTodo(sorted);
    };

    return (
        <div>
            <label>
                Todo:
                <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleChangeTitle}
                />
            </label>
            <button
                type="button"
                onClick={handleClick}
            >add</button>
            <hr />

            <button
                type="button"
                onClick={handleSort}
            >{desc ? '↑' : '↓'}</button>

            <ul>
                {
                    todo.map(item => (
                        <li
                            key={item.id}
                            className={item.isDone ? 'done' : ''}
                        >
                            {item.title}
                            <button
                                type="button"
                                onClick={handleDone}
                                data-id={item.id}
                            >{item.isDone ? 'Undo' : 'Done'}</button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                data-id={item.id}
                            >Remove</button>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}