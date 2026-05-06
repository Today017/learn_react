# learn_react

# 1
## 1-1
- JavaScript: HTML/CSS で単一ページの情報を受け取り、サーバーとの間で非同期にデータの取得や更新があった際に差分だけ JS で処理する。
- ライブラリ vs フレームワーク
	- ライブラリ: ユーザーコードから呼び出されることを想定する。
	- フレームワーク: ユーザーコードはフレームワークによって呼び出される。フレームワークがアプリのライフサイクルを管理する。

## 1-2
- Vite: React アプリを開発するためのコマンドラインツール。トランスパイラー、バンドラー、開発サーバーなどの機能を備える
- Node.js: JavaScript の実行環境。ブラウザから JavaScript 実行エンジンだけを切り切り出したもの。

## 1-3
#### アロー関数
`(引数) => {処理}` の形で関数オブジェクトを記述できる記法。引数が一つのときは `引数 => {処理}`、さらに返り値が1行で書ける場合は `引数 => 返り値` の形でも書けるの注意。
#### `?`
値が `undefined / null` であるかを判定し、そうでない場合のみだけ実際に処理を行う、ということを表す。
#### `Promise<RetType>`
非同期処理を管理するためのオブジェクト。`then` メソッドで実際の中身の値に処理を行える。
```ts
fetch(url)
	.then(response => response.text())
	.then(text => console.log(text))
```

`async / await` を使って次のようにも記述できる。
```ts
async function fetchData() {
	const response = await fetch(url);
	if (!response) throw new Error(response.statusText);
	const text = await response.text();
	console.log(text);
}

fetchData();
```

## 2
### 2-1
```bash
npm create vite@latest #Viteを使ってプロジェクト作成。
cd hoge
npm install #ライブラリをインストール
npm run dev #アプリを実行する
```

`package.json` で使えるコマンドが指定されている。
`main.tsx` がエントリーポイント。

```tsx
createRoot(container[, options])
```
`container`: Reactアプリの埋め込み先
`.render()` メソッドで `<App>` を呼び出している。`<StrictMode>` で `<App>` 要素をくくることで、ReactアプリをStrictモードで実行できる。Strictモードでは良くないコードを検出してくれる。
### 2-2 JSX
Reactではテンプレートを表すためにJSXを利用する。（見た目はタグ文字列だが実態は `ReactElement` 型のオブジェクト（React要素）
React要素を返す関数によってUIの部品を表す。

#### JSXの注意点
- 唯一のルート要素を持つ
	- 複数ある場合は `<></>` または `<Fragment></Fragment>` で囲む
- `{...}` でJSXにJS式を埋め込める
```ts
<p>Hello, {name}</p>
```
- `{...}`で属性値を設定できる
- 実行の際にはJS本来の関数である `createElement` メソッドに変換される。
```ts
createElement(tag [, props, [, ...childlren]])
// tag: タグ名 div, p など
// props: 属性 img/src, img/alt など
// children: 子要素からなる配列
```
## 3
### 3-1
#### Props
親から子どものコンポーネントに値を渡すための窓口
#### State
そのコンポーネント内で変化する値を管理するための仕組み
```tsx
const [state, setState] = useState(initialState);
```
state: State値を格納する変数
setState: State値を更新する関数
- state値を更新するときはsetStateを使わないとうまくいかない
- Reactでは以下のタイミングでコンポーネントが再実行・再描画される
	- Stateが更新された場合
	- 渡されたPropsが変更された場合
	- 親コンポーネントが再描画された場合
> PropsからStateへの複製は気をつけること
> Propsは先祖のコンポーネントから任意のタイミングで変更される可能性がある一方、Stateが初期化されるのは初回の描画タイミングのみのため。
>
> ついでにいうと、Propsはそもそも変更しないこと

##### イベント
- イベントハンドラ: イベントによって呼び出されるコード（関数）
- Reactのコンポーネントは基本的に純粋関数（副作用なし・同じ引数なら同じ戻り値）であるべき
	- 純粋でない操作はイベントハンドラに集約させる

### 3-2
#### mapメソッド
```tsx
list.map((value, index, array) => {
	statements...
})
```
個々の要素を順にコールバック関数で加工し、最終的にできた新しい配列を返す。
##### key属性
リスト配下の項目には`key`属性を付けておくことで特定の項目が追加・削除されたときにリスト全体が再生成されるのを防ぐことができる。（そのループの中で一意であればよい）

#### `||` `&&`
- `{condition && <Component />}`: 条件が真のときだけ `<Component />` を表示する
- `{condition || <Component />}`: 条件が偽のときだけ `<Component />` を表示する

### 3-3
#### children
コンポーネントの開始タグと終了タグの間に挟まれた内容を表す特別なProps
```tsx
<Component>
    <p>子要素</p>
</Component>
```
上記のような呼び出しをしたとき、`Component` 内で`props.children` を参照することで `<p>子要素</p>` を取得できる。
- `props.children` は配列であることもあるため、単一の要素を想定している場合は注意が必要。
- `props.children` は任意の値を取ることができるため、関数を渡すこともできる。
```tsx
<Component>
    {(elem) => (
        <p>{elem}</p>
    )}
</Component>
```
上記のような呼び出しをしたとき、`Component` 内で`props.children('Hello')` を呼び出すと `<p>Hello</p>` を取得できる。

#### Stateについて
子のコンポーネントから親のコンポーネントの状態を更新したいときは、親のコンポーネントにおけるStateの更新関数を子のコンポーネントに渡すことで実現できる。
```tsx
function Parent() {
    const [count, setCount] = useState(0);
    const updateCount = () => setCount(count + 1);

    return (
        <Child updateCount={updateCount} />
    );
}
```

このとき直接 `setCount` を渡すこともできる。

- 親が `setCount` を `updateCount` にラップして渡す場合
    - 更新のルールは親が管理する
- 親が `setCount` を直接渡す場合
    - 更新のルールは子が管理する
        - `setCount(count+1)` とすることも `setCount(100)` とすることもできる

基本的には子には最低限の権限・情報しか渡さない方が綺麗な設計とされている。

### 3-4
#### イベントオブジェクト

イベントに関する情報を管理するオブジェクト。
イベントハンドラに引数として渡される。

#### イベントの伝播
イベントはが発生したら、最上位の window オブジェクトから下位の要素にイベントを伝播していく。（キャプチャリング）
イベントが発生した要素を特定（ターゲット）した後、イベントは下位の要素から上位の要素に伝播していく。（バブリング）

イベント処理はイベントの発生元だけで実行されるわけではないことに注意。

規定ではパブリングフェーズ（帰りがけ順）にイベントが処理されていくが、以下のようにして伝播を制御することができる。
- `onEventCapture`: `onEvent` ではなく `onEventCapture` を使うとキャプチャリングフェーズ（行きがけ順）にイベントが処理される。
- `event.stopPropagation()`: イベントハンドラで呼び出すことで、イベントの伝播を止めて、以降の処理を防ぐことができる。
- `event.preventDefault()`: イベントハンドラで呼び出すことで、イベントのデフォルトの動作を止めることができる。

