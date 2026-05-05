import { Fragment } from "react/jsx-runtime";
import Download from "./Download";
import icon from './../../../assets/hero.png'; // ちょうどいい感じのアイコン画像がないので適当に

interface Item {
    item: string;
    price: number;
    sell: boolean;
}


// function Icon(item: Item) {
// <Item item={hoge} /> のように呼び出すと、{ item: hoge } という形で渡されため、
// 引数は { item }: { item: Item } という形で受け取る必要がある。

function Icon({ item }: { item: Item }) {
    return (
        <img src={icon} alt={item.item} />
    );
}


function ForItem({ item, index }: { item: Item, index: number }) {
    return (
        <Fragment key={index}>
            <dt>
                {index + 1}. {item.item}
            </dt>
            <dd>
                This is the description of {item.item}.
                {item.sell && <Icon item={item} />} 
                {/* ↑trueなら実行 */}
                {item.sell && <Download />}
                {item.sell || <p>Not for sale</p>}
                {/* ↑falseなら実行 */}
            </dd>
        </Fragment >
    );
}

export let items: Item[] = [
    { item: 'Item A', price: 50, sell: true },
    { item: 'Item B', price: 150, sell: false },
    { item: 'Item C', price: 30, sell: true },
    { item: 'Item D', price: 200, sell: false },
];

export default function ForList({ src }: { src: Item[] }) {
    // {...} 以下の配列はそのまま順番に並べて表示される

    const isLowPrice = (price: number) => price < 100;
    const lowPriceItems = src.filter(item => isLowPrice(item.price));
    const sortedLowPriceItems = [...lowPriceItems].sort((a, b) => a.price - b.price);

    return (
        <dl>
            {
                sortedLowPriceItems.map((item, index) => (
                    <ForItem key={index} item={item} index={index} />
                ))
                // src.map((item, index) => (
                //     <Fragment key={index}>
                //         <dt>
                //             {index + 1}. {item}
                //         </dt>
                //         <dd>
                //             This is the description of {item}.
                //         </dd>
                //     </Fragment>
                // ))
            }
        </dl>
    );
}
