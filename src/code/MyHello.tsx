class MyHelloProps {
    name: string;
}

export default function MyHello(props: MyHelloProps) {
    return <h1>Hello, {props.name}!</h1>;
}