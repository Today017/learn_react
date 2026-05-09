# 4-2 State における構造化データの更新

## 大原則：State は必ずセッター経由で更新する

State にオブジェクト・配列が入っていても、**直接ミューテーションは不可**。必ず `setXxxx` 関数に**新しいオブジェクト/配列**を渡す。

```ts
// ❌ 不可：直接代入してもReactは変更を検知できない
const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
  form[e.target.name] = e.target.value;
};

// ✅ 正しい：新しいオブジェクトを作ってセッターに渡す
const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};
```

### なぜそう設計されているか・補足

React は State の変更を **`Object.is` による参照比較**（厳密には浅い等価判定）で検知する。同じオブジェクトの中身を書き換えても参照値は変わらないので、React からは「変化なし」に見えて再レンダーが走らない。これが Reactにおける **immutable update（不変更新）** が必須な理由。

「セッター経由」というよりも、より本質的には **新しい参照を渡す**ことが必要。たとえ `setForm(form)` のように同じオブジェクト参照を渡しても再レンダーは起きない。

### 実践上の注意点・アンチパターン

- `form.name = 'X'; setForm(form);` は再レンダーされない（参照が同じ）。
- `useReducer` を使っても本質は同じ。reducer 内でも新しい参照を返すこと。
- React 19 / Concurrent Rendering 時代では、ミューテーションするとバッチ化やストアの一貫性が壊れて、不可解なバグになる。

---

## 4-2-1 スプレッド構文の意味

`{...obj}` は「**オブジェクトを複製したうえで分解**して新しいオブジェクトに展開」する構文。

```ts
const obj = { x: 10, y: 20 };
const copied = { ...obj }; // 新しいオブジェクト（参照が違う）
// copied = obj はNG → 同じ参照を copied という別名で持つだけ
```

State 更新でよく使うパターン：

```ts
setForm({
  ...form,                          // 既存プロパティをすべて複製
  [e.target.name]: e.target.value,  // 該当プロパティだけ上書き
});
```

意味は「**既存の入力を複製し、更新部分だけを上書きする**」。

### スプレッド構文は「浅い」複製

スプレッド構文・`Object.assign` ともに **shallow copy（浅いコピー）**。トップレベルのプロパティはコピーされるが、ネストしたオブジェクトは**参照値**がコピーされるだけで実体は共有される。

```ts
const a = { nested: { x: 1 } };
const b = { ...a };
b.nested.x = 99;
console.log(a.nested.x); // 99 ← aも書き換わってしまう
```

### なぜそう設計されているか・補足

deep copy をデフォルトにすると、性能コスト（再帰的な複製）が大きく、循環参照や Date / Map / Set / クラスインスタンスを正しく扱えない。**「変更しないつもりの部分は参照を共有しても安全」** という前提（つまり immutable な使い方を前提にしているなら浅いコピーで足りる）に立った合理的な設計。

deep copy が本当に必要なら：
- `structuredClone(obj)`（モダンブラウザ・Node 17+）
- 各層を明示的にスプレッドする（後述のネスト State 対策）
- Immer を使う（実体は **構造的共有** で必要な部分だけコピーする）

---

## 入れ子の State の更新

ネストした State を「正しく」更新するには、**変更が及ぶ階層をすべて複製**する必要がある。

```ts
import { useState, ChangeEvent } from 'react';

type Address = {
  prefecture: string;
  city: string;
};

type Form = {
  name: string;
  address: Address;
};

export default function StateNest() {
  const [form, setForm] = useState<Form>({
    name: '山田太郎',
    address: {
      prefecture: '広島県',
      city: '榛原町',
    },
  });

  // 1段目（name）の更新
  const handleForm = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 2段目（address.prefecture / address.city）の更新
  const handleFormNest = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,                                   // formを複製
      address: {
        ...form.address,                         // addressも複製
        [e.target.name]: e.target.value,         // 該当プロパティだけ上書き
      },
    });
  };

  const show = () => {
    console.log(`${form.name} (${form.address.prefecture}・${form.address.city})`);
  };

  return (
    <form>
      <div>
        <label htmlFor="name">名前：</label>
        <input id="name" name="name" type="text"
          onChange={handleForm} value={form.name} />
      </div>
      <div>
        <label htmlFor="prefecture">住所（都道府県）：</label>
        <input id="prefecture" name="prefecture" type="text"
          onChange={handleFormNest} value={form.address.prefecture} />
      </div>
      <div>
        <label htmlFor="city">住所（市町村）：</label>
        <input id="city" name="city" type="text"
          onChange={handleFormNest} value={form.address.city} />
      </div>
      <div>
        <button type="button" onClick={show}>送信</button>
      </div>
    </form>
  );
}
```

### なぜ階層ごとに複製が必要か

スプレッドは浅いコピーなので、`{...form}` だけでは `form.address` は**元のオブジェクトと同じ参照**のまま。そのまま `address[name] = value` してしまうと元の State をミューテーションすることになる。だから `address` も `{...form.address, ...}` で複製する。

### 実践上の注意点・アンチパターン

- **State はできるだけフラットに保つ**。階層が深いほど更新コードが冗長になり、複製漏れバグの温床になる。
- 入れ子が必要に見える時は、まず**正規化**（後述）を検討する。
- 1ハンドラ1階層に分けると DRY 違反になりやすい → 後述の「ハンドラーを共通化する」 か Immer を導入する。

---

## State の正規化（Note）

階層のある State は**情報の重複**を生み、更新漏れや肥大化の原因になる。データベースの「正規化」と同じ発想で分割する。

例：書籍情報を 1 つの State に押し込める形

```ts
// ❌ 階層が深く、author/publisher が重複しがち
type BadBookList = {
  isbn: string;
  title: string;
  author: { name: string; address: string; birth: string };
  publisher: { name: string; address: string };
}[];
```

正規化後：

```ts
// ✅ id 参照で重複を排除
type Book = { isbn: string; title: string; authorId: string; publisherId: string };
type Author = { id: string; name: string; address: string; birth: string };
type Publisher = { id: string; name: string; address: string };

const [books, setBooks] = useState<Book[]>([]);
const [authors, setAuthors] = useState<Record<string, Author>>({});
const [publishers, setPublishers] = useState<Record<string, Publisher>>({});
```

### なぜ正規化するか・補足

- 重複情報があると「ある情報が変わったときどこを直せばよいか」がぼやけて更新漏れが起きる。
- ネストの除去により、スプレッドの階層も浅くなる。
- 配列より **`Record<id, T>` (オブジェクトマップ)** にしておくと、id でのルックアップが O(1)、更新時も `{ ...map, [id]: { ...map[id], updated: true } }` で済む（Redux Toolkit / `createEntityAdapter` がやっていることと同じ）。

実践上は、`useState` を分割するか、`useReducer` でドメインごとにまとめるか、Zustand / Jotai / Redux Toolkit のようなストアを導入するかの判断軸になる。

---

## 4-2-2 Immer ライブラリによる改善

State の構造を変えられないとき（API レスポンスとの構造一致が必要、など）に有効なのが **Immer**。React 用フック `useImmer` が提供されている。

```bash
npm install use-immer immer
```

### Immer 版の入れ子 State 更新

```ts
import { useImmer } from 'use-immer';
import { ChangeEvent } from 'react';

type Form = {
  name: string;
  address: { prefecture: string; city: string };
};

export default function StateNestImmer() {
  const [form, setForm] = useImmer<Form>({
    name: '山田太郎',
    address: { prefecture: '広島県', city: '榛原町' },
  });

  const handleForm = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(draft => {
      // ✅ 直接代入してOK（Immer内部で複製を作っている）
      (draft as any)[e.target.name] = e.target.value;
    });
  };

  const handleFormNest = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(draft => {
      (draft.address as any)[e.target.name] = e.target.value;
    });
  };

  // ...
}
```

### useImmer のセッターの性質

`useImmer` のセッター（`updater`）は通常の setState とは違う：

| 観点 | `useState` のセッター | `useImmer` のセッター |
|------|--------------------|--------------------|
| 引数 | 新しい値 or `(prev) => 新しい値` | `(draft) => void`（draft を直接書き換える） |
| 更新方法 | 不変更新を自前で書く | draft への代入が「変更」として記録される |
| 内部動作 | 渡された値で置き換える | draft の変更箇所だけ複製（**構造的共有**） |

### なぜ Immer が直接代入できるのか・補足

Immer は **Proxy** で `draft` をラップしており、`draft.x = 1` のような代入を検知して「最終的に新しい不変オブジェクトを生成」する。変更されなかった部分は元のオブジェクトと**参照を共有**するので、メモリ効率も良いし、`useMemo` / `React.memo` の参照比較も活きる。

### TypeScript で Immer を使う際の注意

- `e.target.name` は `string` 型なので、`form` のキーとして使うときは `keyof` 型に narrow しないと TS が文句を言う。`as keyof Form` などのアサーションか、より厳密にしたいなら専用のハンドラを用意する。
- Immer は `Date`, `Map`, `Set` 等もサポートするが、**class インスタンスは `[immerable] = true` を設定**しないと freeze されてエラーになる。

### 実践上の注意点・アンチパターン

- Immer を入れたからといって**多用するのは避ける**。深いネスト State を許容する免罪符にしない。まずは正規化を試みる。
- `setForm(draft => draft.x = ...)` のように **`draft` を `return` してはいけない**（戻り値を返すと、Immer はそれを「新しい State」と解釈してしまう）。書き換えるだけなら `void` 関数として書く。
- `setForm(newValue)` のように直接値を渡すこともできる（`useState` 互換）が、混在させるとコードが読みにくくなる。

---

## ハンドラーを共通化する

階層ごとにハンドラを分けるのではなく、**input の `name` に階層を埋め込んで** 1 つのハンドラで処理する。

```tsx
import { useImmer } from 'use-immer';
import { ChangeEvent } from 'react';

type Form = {
  name: string;
  address: { prefecture: string; city: string };
};

export default function StateNestImmer2() {
  const [form, setForm] = useImmer<Form>({
    name: '山田太郎',
    address: { prefecture: '広島県', city: '榛原町' },
  });

  const handleNest = (e: ChangeEvent<HTMLInputElement>) => {
    // 要素名を "." で分解（"address.city" → ["address", "city"]）
    const ns = e.target.name.split('.');
    setForm(draft => {
      if (ns.length === 1) {
        (draft as any)[ns[0]] = e.target.value;
      } else {
        (draft as any)[ns[0]][ns[1]] = e.target.value;
      }
    });
  };

  return (
    <form>
      <div>
        <label htmlFor="name">名前：</label>
        <input id="name" name="name" type="text"
          onChange={handleNest} value={form.name} />
      </div>
      <div>
        <label htmlFor="prefecture">住所（都道府県）：</label>
        <input id="prefecture" name="address.prefecture" type="text"
          onChange={handleNest} value={form.address.prefecture} />
      </div>
      <div>
        <label htmlFor="city">住所（市町村）：</label>
        <input id="city" name="address.city" type="text"
          onChange={handleNest} value={form.address.city} />
      </div>
    </form>
  );
}
```

### なぜこの設計か・補足

- 階層が増えても「分岐を 1 つ増やす」だけで対応できる。
- ただし任意の n 階層に汎用的に対応するコード（`reduce` で再帰的に辿るなど）まで書くのは、本書の指摘どおり**過剰**。素直に State をフラットにすべき場面が多い。
- 汎用的に書く場合の参考実装：
  ```ts
  setForm(draft => {
    let obj: any = draft;
    for (let i = 0; i < ns.length - 1; i++) obj = obj[ns[i]];
    obj[ns[ns.length - 1]] = e.target.value;
  });
  ```

### 実践上の注意点・アンチパターン

- `name` 属性に階層構造を持たせるのは React Hook Form / Formik と同じ発想。本格的にやるなら**最初からそれらのライブラリを使う**ほうが型安全（パスを文字列リテラル型で表せる）で、バリデーションも組み込みやすい。
- 上記の `as any` は型情報が落ちるのが痛い。厳密にやるなら `name` をユニオン型で制約し、`Record<keyof Form, ...>` で分岐する設計にする。

---

## 4-2-3 配列の更新

配列も同じく直接更新は不可。**非破壊的（戻り値で新しい配列を返す）メソッドだけを使う**。

| 操作 | ✅ 利用すべき | ❌ 避けるべき |
|------|-------------|-------------|
| 追加 | `concat`、`[...list]` | `push`、`unshift` |
| 更新 | `map` | `splice`、`list[i] = …` |
| 削除 | `filter`、`slice` | `pop`、`shift`、`splice` |
| ソート | あらかじめ配列を複製 | `sort`、`reverse`（直接呼ぶ） |

「避けるべき」側はすべて **元の配列を破壊する**メソッド。State の不変性を破る。

### 補足：ES2023 で増えた選択肢

ES2023 で **非破壊版**が追加された：
- `toSorted()`（`sort` の不変版）
- `toReversed()`（`reverse` の不変版）
- `toSpliced()`（`splice` の不変版）
- `with(i, value)`（`list[i] = value` の不変版）

モダンブラウザ・Node 20+ で使える。型は `Array<T>` に標準で生えている。

### Immer を使えば破壊的メソッドも OK

Immer の draft 上では `push` / `splice` / `sort` も使ってよい。「直感的に書きたい」が動機なら Immer を入れる選択肢もある。

---

## 配列への追加 — Todo の新規登録

```tsx
import { useState, ChangeEvent } from 'react';

type Todo = {
  id: number;
  title: string;
  created: Date;
  isDone: boolean;
};

export default function StateTodo() {
  // Todo項目id の最大値（登録ごとにインクリメント）
  const [maxId, setMaxId] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [todo, setTodo] = useState<Todo[]>([]);

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleClick = () => {
    setTodo([
      ...todo,                            // ← 既存の配列を複製
      {                                   // ← 新規要素を追加
        id: maxId,
        title,
        created: new Date(),
        isDone: false,
      },
    ]);
    setMaxId(id => id + 1);
  };

  return (
    <div>
      <label>
        やること：
        <input type="text" name="title"
          value={title} onChange={handleChangeTitle} />
      </label>
      <button type="button" onClick={handleClick}>追加</button>
      <hr />
      <ul>
        {todo.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### なぜ key を付けるのか・補足

`<li key={item.id}>` の `key` は React が**配列内の各要素のアイデンティティ**を識別するために必須。これがあるおかげで、要素の追加・削除・並び替え時に DOM を作り直さず再利用できる。

- `key` を `index` で代用すると、要素の途中挿入・削除・ソート時に**入力フォーカスや内部 State が崩れる**バグになる。安定した一意 ID（`id`、UUID など）を使う。
- `Date.now()` や `Math.random()` を `key` に使うのも NG（再レンダーごとに変わる）。

### maxId の設計について

本書では `useState(1)` で持って自前でインクリメントしているが、実用では：
- **`crypto.randomUUID()`** や **nanoid** で衝突しない ID を発行する
- サーバ側で ID を払い出す（DB の AUTO_INCREMENT）
- 一旦クライアントで仮 ID を振って、サーバ保存後に置き換える

`useState` でカウンタを持つやり方は**並行性に弱い**（StrictMode の二重実行や複数のクリックで同じ ID が振られうる）。

---

## 配列の更新 — Todo の済チェック

`map` で「**条件に合う要素だけ複製して書き換え**、その他はそのまま返す」のが定石。

```tsx
import { ChangeEvent, MouseEvent } from 'react';

const handleDone = (e: MouseEvent<HTMLButtonElement>) => {
  const targetId = Number((e.currentTarget as HTMLButtonElement).dataset.id);
  setTodo(todo.map(item => {
    if (item.id === targetId) {
      // ✅ 該当要素は複製したうえで書き換え
      return { ...item, isDone: true };
    } else {
      // 一致しない要素はそのまま返す（参照を維持）
      return item;
    }
  }));
};

// JSX側
<li key={item.id} className={item.isDone ? 'done' : ''}>
  {item.title}
  <button type="button"
    onClick={handleDone} data-id={item.id}>済</button>
</li>
```

### なぜこのパターンが「型」なのか・補足

- 一致しない要素は `return item` で**そのまま返す**ことが重要。これにより **参照が維持される** ので、後段で `React.memo` した子コンポーネントが不要に再レンダーされない。
- `todo[index].isDone = true` のような直接代入は不可（State 直接ミューテーション）。
- `e.target.dataset.id` は `string | undefined`。`Number(undefined) = NaN` になるので、id が数値型なら `Number()` で揃える。

### 実践上の注意点・アンチパターン

- **`e.target` vs `e.currentTarget`**: 子要素を含む button の場合、`e.target` はクリックされた最も内側の要素を指すので、`data-id` を付けたボタン自身を取りたいなら `e.currentTarget` を使うほうが安全。
- **HTMLAttributes の data-* を TS で型付け**: `data-id={item.id}` は素の React の型に存在するが、`dataset` で取り出すと `DOMStringMap` で全プロパティ optional `string`。安全に取りたいなら、ボタン側で `onClick={() => handleDone(item.id)}` のようにクロージャで渡すほうが TS 的に楽。
- **クロージャで渡す版（推奨）**:
  ```tsx
  const handleDone = (id: number) => {
    setTodo(todo.map(item =>
      item.id === id ? { ...item, isDone: true } : item
    ));
  };
  // ...
  <button onClick={() => handleDone(item.id)}>済</button>
  ```
  data-* 属性経由よりも型安全で読みやすい。本書が `data-id` 方式を使うのは「3-4-2 で説明した独自データ属性のおさらい」のためで、実コードは上記のクロージャ方式が一般的。

### 関数型セッター（推奨）

`setTodo(todo.map(...))` だと、現在の `todo` がクロージャに閉じ込められて古い値を見るリスクがある。

```ts
setTodo(prev => prev.map(item =>
  item.id === id ? { ...item, isDone: true } : item
));
```

複数のセッター呼び出しが連続する場合や、async 処理を挟む場合は**関数型を使うのが無難**。

---

## 配列の削除 — Todo 項目の破棄

`filter` で「条件に合う要素だけ残した新しい配列」を作る。

```ts
const handleRemove = (id: number) => {
  setTodo(prev => prev.filter(item => item.id !== id));
};

// JSX
<button type="button" onClick={() => handleRemove(item.id)}>削除</button>
```

### なぜ filter を使うのか・補足

- `filter` は新しい配列を返すので不変性を保てる。
- 残す側を述語で記述することで、**条件が直感的**（「残したい」を書く）。
- `splice` は破壊的なうえ、戻り値が「削除された要素」で結果配列ではないので、State 更新には使いにくい。

### slice で削除したいとき

特定インデックスの 1 件削除なら：
```ts
setTodo(prev => [...prev.slice(0, i), ...prev.slice(i + 1)]);
```
`slice` は「指定範囲を切り出した新しい配列」を返すので非破壊。

---

## 配列の並べ替え — Todo の昇順／降順ソート

`sort` は破壊的メソッドなので、**先に複製してからソート**する。

```ts
import { useState } from 'react';

const [desc, setDesc] = useState<boolean>(true);

const handleSort = () => {
  // ✅ 既存のTodoリストを複製してからソート
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

// JSX
<button type="button" onClick={handleSort}>
  ソート（{desc ? '↑' : '↓'}）
</button>
```

### なぜ複製が必要か・補足

`Array.prototype.sort` は**元配列を破壊しつつ、戻り値として同じ参照を返す**。State の参照を直接ソートすると：
- React が変更を検知できない（参照同じ）
- 元の State が壊れて、ロールバックや差分検出が機能しない

`[...todo]` で**新しい配列**を作ってから `sort` すれば、新しい参照になるので React も検知でき、元の `todo` は無傷のまま。

### ES2023 の `toSorted` を使うとよりシンプル

```ts
const sorted = todo.toSorted((m, n) =>
  desc ? n.created.getTime() - m.created.getTime()
       : m.created.getTime() - n.created.getTime()
);
setTodo(sorted);
```

非破壊なので、`[...todo]` の複製ステップを省ける。

### 実践上の注意点・アンチパターン

- **`Date` の比較は `getTime()` で数値化**して引き算するのが定石。`Date` 同士の `-` は内部的に valueOf 経由で動くが、TS だとエラーになることがある（`a.getTime() - b.getTime()` のほうが安全）。
- **`sort` の比較関数は number を返す**：負/0/正で順序が決まる。boolean を返すと挙動が壊れる。
- **派生 State 化を検討**: 「ソート方向」と「ソート結果」を別々の State にすると、ソート以外で `todo` が変わったときにソートが効かなくなる（再ソート漏れ）。本来は `desc` だけを State に持ち、表示時に `useMemo(() => [...todo].sort(...), [todo, desc])` で派生させるほうが堅牢。

---

## 関連概念・周辺知識

### 構造的共有（Structural Sharing）

Immer や Immutable.js が採用している考え方。「変更された部分だけ新しいオブジェクトを作り、変更されていない部分は元の参照を再利用する」。

```
元: { a: { x: 1 }, b: { y: 2 } }
変更: a.x を更新
結果: { a: { x: 99 }, b: <元のbと同じ参照> }
```

これにより「不変性を保ちつつ、メモリと比較コストを最小化」できる。`React.memo` や `useMemo` の依存比較が高速に効くのもこのおかげ。

### `useReducer` を使うべき境界

`useState` で更新ロジックが膨らんできたら `useReducer` を検討する。とくに：
- 同じ State を**複数の場所から異なる方法で更新**する（Todo の追加・更新・削除・ソート）
- 更新に**前の State を参照**する必要がある
- 更新ロジックを**コンポーネント外でテストしたい**

```ts
type TodoAction =
  | { type: 'add'; title: string }
  | { type: 'done'; id: number }
  | { type: 'remove'; id: number }
  | { type: 'sort'; desc: boolean };

const reducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'add':    return [...state, /* ... */];
    case 'done':   return state.map(/* ... */);
    case 'remove': return state.filter(/* ... */);
    case 'sort':   return [...state].sort(/* ... */);
  }
};
```

Immer を組み合わせると `useImmerReducer` でさらに簡潔になる。

### React Hook Form / Formik

「ハンドラーを共通化する」節は、本格的には専用ライブラリの領域。

| ライブラリ | 特徴 |
|----------|------|
| React Hook Form | 非制御コンポーネント中心、軽量、レンダー数が少ない |
| Formik | 制御コンポーネント中心、TS 対応はやや弱め |
| TanStack Form | 型付けが強力、フレームワーク非依存 |

ネストしたフォームを扱うなら、自前で `name` を分解するより最初からこれらを入れたほうが楽。

### `Object.is` と React の比較

React は State / props の変更検知に `Object.is`（≒ 厳密等価）を使う。

```ts
Object.is(NaN, NaN); // true（=== は false）
Object.is(+0, -0);   // false（=== は true）
```

ほぼ `===` と同じ振る舞いだが、`NaN` の扱いだけ違う。要は**参照比較**しかしないので、内容が同じでも参照が違えば「変わった」とみなされ、参照が同じなら「変わってない」とみなされる。これが不変更新の存在意義。
