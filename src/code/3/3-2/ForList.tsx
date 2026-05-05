import { Fragment } from "react/jsx-runtime";

interface Item {
    item: string;
    price: number;
    sell: boolean;

    // constructor(item: string, price: number) {
    //     this.item = item;
    //     this.price = price;
    // }
}

import icon from '../../assets/icon.png';
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
                {item.sell || <p>Not for sale</p>}
            </dd>
        </Fragment>
    );
}


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