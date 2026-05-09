# 4-1 フォーム操作の基本

## Controlled Input（制御された入力）

ReactでのフォームのStateによる管理方式を **Controlled Input** と呼ぶ。フォーム要素の値を State で一元管理し、`value` 属性と `onChange` を紐づけることで、常に State が「唯一の真実の源」となる。

```jsx
import { useState } from 'react';

export default function StateForm() {
  const [form, setForm] = useState({
    name: '山田太郎',
    age: 18
  });

  const handleForm = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value  // 算出プロパティ名
    });
  };

  return (
    <form>
      <input id="name" name="name" type="text"
        onChange={handleForm} value={form.name} />
      <input id="age" name="age" type="number"
        onChange={handleForm} value={form.age} />
    </form>
  );
}
```

### フォームState設計の2つのルール

1. **フォームに関わる値はひとつのオブジェクトにまとめる**
2. **フォーム要素の `name` 属性と State のプロパティ名を一致させる**

このルールがあることで、`[e.target.name]: e.target.value` という**算出プロパティ名**（1-3-2項）による汎用ハンドラーが成立する。`name` を揃えていなければ、要素ごとに個別ハンドラーが必要になる。

### なぜそう設計されているか・補足

- `...form` でスプレッドした後に `[e.target.name]: e.target.value` を上書きするパターンは、Reactの**イミュータブル更新**の慣用句。Stateを直接変更せず新オブジェクトを生成することで、Reactが変更を検知できる。
- Controlled Inputの最大のメリットは、**Stateを参照するだけで入力値が取れる点**（`form.name` 等）。DOM要素へのアクセスが不要になる。
- 入力のたびに再描画が発生するため、大量フィールドや高頻度入力では注意が必要。

### 実践上の注意点・アンチパターン

- `value` を渡しても `onChange` を渡さないと読み取り専用になり、ユーザーが入力できなくなる（Reactが警告を出す）。必ずセットで設定する。
- State に数値型で初期化していても、`e.target.value` は常に文字列。必要なら `Number(e.target.value)` で変換する。

---

## 算出プロパティ名（Computed Property Name）

```js
const key = 'name';
const obj = { [key]: 'value' };  // { name: 'value' }
```

JavaScriptの構文で、`[]` 内の式を評価した結果をプロパティ名として使う。`e.target.name` を使うことで、複数フォーム要素を1つのハンドラーで処理できる。

---

## useId 関数

コンポーネントが複数箇所で呼び出された場合、`id` をハードコーディングすると DOM 上で重複する。`useId()` を使うと、コンポーネントインスタンス単位で一意な ID が得られる。

```jsx
import { useId, useState } from 'react';

export default function StateForm() {
  const id = useId();

  return (
    <form>
      <label htmlFor={`${id}-name`}>名前：</label>
      <input id={`${id}-name`} name="name" ... />
      <label htmlFor={`${id}-age`}>年齢：</label>
      <input id={`${id}-age`} name="age" ... />
    </form>
  );
}
```

生成される ID は `r0`、`r1` のような接頭辞付き文字列になる（例：`r0-name`）。

### なぜそう設計されているか・補足

- `<label htmlFor>` と `<input id>` の対応は、クリックでフォーカスが当たるアクセシビリティ機能に必要。ID が重複すると正しく動作しない。
- `useId` は React 18 で追加された。サーバーサイドレンダリング（SSR）でもサーバーとクライアントで同じ ID が生成される保証がある（Math.random() 等と違う点）。

### 複数 React アプリが同一ページに存在する場合

`createRoot` の第2引数に `identifierPrefix` を渡すと、アプリ間での ID 重複を防げる。

```js
const root = createRoot(document.getElementById('root'), {
  identifierPrefix: 'my-react-',
});
```

### 実践上の注意点

- リストの `key` 属性には `useId` を使ってはいけない（`key` はデータから生成すべき）。

---

## 4-1-2 注意：onChange と JavaScript の change イベントの違い

| イベント | 発生タイミング |
|---|---|
| JavaScript の `change` | フォーカスを外した（変更確定）とき |
| JavaScript の `input` | 何らかの変更が加えられたとき（即座に） |
| React の `onChange` 属性 | **`input` イベントと同じ**（即座に反応） |

React の `onChange` は名前から `change` イベントを想像させるが、実際には `input` イベントに基づいて動作する。テキスト入力がリアルタイムに反映されるのはこのため。

### なぜそう設計されているか・補足

React は**宣言的UI**の一貫性を優先するため、「入力値を即座に State に同期する」設計が自然。`change` イベントのようにフォーカスアウト後にのみ発火する仕様では、State とUIの乖離が生じやすい。

### 実践上の注意点

- JavaScript 本来の `change` イベント（フォーカスアウト時）を React で実装したい場合は、`addEventListener` を直接呼ぶか `onBlur` 属性で代替する（React の標準では提供されていない）。

---

## Uncontrolled Input（制御されない入力）

State で値を保持せず、DOM 要素に直接アクセスする方式。`useRef` でフォーム要素への参照（Ref オブジェクト）を取得し、`ref.current.value` で値を読み出す。

```jsx
import { useRef } from 'react';

export default function StateFormUC() {
  const name = useRef(null);
  const age = useRef(null);

  const show = () => {
    console.log(`こんにちは、${name.current.value} (${age.current.value} 歳) さん！`);
  };

  return (
    <form>
      <input name="name" type="text" ref={name} defaultValue="佐藤理央" />
      <input name="age" type="number" ref={age} defaultValue="18" />
      <button type="button" onClick={show}>送信</button>
    </form>
  );
}
```

### Controlled vs Uncontrolled の比較

| | Controlled Input | Uncontrolled Input |
|---|---|---|
| 値の保持 | State | DOM 要素 |
| 再描画 | 入力のたびに発生 | 発生しない |
| リアルタイム検証 | 容易 | 困難 |
| 初期値の設定 | `value` + State 初期値 | `defaultValue` 属性 |
| 実装の複雑さ | やや複雑 | シンプル |
| ファイル入力 | 不可（常に Uncontrolled） | 可能 |

### なぜそう設計されているか・補足

- `useRef` は再描画をトリガーせずに値を保持できる仕組み。DOM 参照以外にも「再描画をまたいで値を保持したいが State で管理する必要はない」ケースに使える汎用フック。
- Uncontrolled は非 React（jQueryなど）との既存コードとの統合が容易。

### 既定値の設定

Uncontrolled Input では `value` ではなく `defaultValue` を使う。`value` を設定すると値がロックされ、ユーザーが変更できなくなる。

```jsx
// NG: 値がロックされ入力不可になる
<input value="佐藤理央" />

// OK: 初期値として設定され、ユーザーが変更できる
<input defaultValue="佐藤理央" />
```

チェックボックス・ラジオボタンも同様：

```jsx
// NG
<input type="checkbox" checked />
// OK
<input type="checkbox" defaultChecked />
```

---

## 4-1-4 各フォーム要素の実装

### テキストエリア

React では `<textarea>` の値は子コンテンツではなく `value` 属性で表す（標準 HTML と異なる）。

```jsx
<textarea
  name="comment"
  value={form.comment}
  onChange={handleForm}
/>
```

### 選択ボックス（単一選択）

`<select>` の現在値は `value` 属性で表す。標準 HTML の `<option selected>` は使わない。

```jsx
<select name="animal" value={form.animal} onChange={handleForm}>
  <option value="dog">イヌ</option>
  <option value="cat">ネコ</option>
</select>
```

### リストボックス（複数選択）

`multiple={true}` と `value` に配列を渡す。`e.target.value` では最初の選択値しか取得できないため、`e.target.options` を走査して選択値を収集する。

```jsx
<select name="animal" value={form.animal}
  size="4" multiple={true} onChange={handleFormList}>
  ...
</select>
```

```js
const handleFormList = e => {
  const data = [];
  const opts = e.target.options;
  for (const opt of opts) {
    if (opt.selected) data.push(opt.value);
  }
  setForm({ ...form, [e.target.name]: data });
};
```

State の初期値も配列にする：`animal: ['dog', 'hamster']`

### ラジオボタン

`checked` 属性に `State の現在値 === このボタンの value` の真偽値を渡す。

```jsx
<input type="radio" name="os" value="windows"
  checked={form.os === 'windows'} onChange={handleForm} />
<input type="radio" name="os" value="mac"
  checked={form.os === 'mac'} onChange={handleForm} />
```

### チェックボックス（単一）

`checked` に boolean の State を紐づけ、更新時は `e.target.checked`（value ではない）を使う。

```jsx
<input type="checkbox" name="agreement"
  checked={form.agreement} onChange={handleFormCheck} />
```

```js
const handleFormCheck = e => {
  setForm({ ...form, [e.target.name]: e.target.checked });
};
```

### チェックボックス（複数選択）

State を配列で管理し、チェック時は追加・解除時は削除する。`checked` の判定には `includes()` を使う。

```jsx
<input type="checkbox" name="animal" value="dog"
  checked={form.animal.includes('dog')} onChange={handleFormMulti} />
```

```js
const handleFormMulti = e => {
  const fa = [...form.animal];  // 配列をコピー
  if (e.target.checked) {
    fa.push(e.target.value);
  } else {
    fa.splice(fa.indexOf(e.target.value), 1);
  }
  setForm({ ...form, [e.target.name]: fa });
};
```

### ファイル入力ボックス

セキュリティ上、アプリ側からファイルを指定することはできない。そのため、**常に Uncontrolled Input として実装する**。

```jsx
const file = useRef(null);

function show() {
  const fs = file.current.files;  // FileList オブジェクト
  for (const f of fs) {
    console.log(`ファイル名：${f.name}`);
    console.log(`種類：${f.type}`);
    console.log(`サイズ：${Math.trunc(f.size / 1024)}KB`);
  }
}

return (
  <form>
    <input type="file" ref={file} multiple />
    <button type="button" onClick={show}>送信</button>
  </form>
);
```

**File オブジェクトの主なプロパティ：**

| プロパティ | 概要 |
|---|---|
| `name` | ファイル名 |
| `type` | コンテンツタイプ（MIME型） |
| `size` | ファイルサイズ（バイト） |
| `lastModified` | 最終更新日時（UNIX時間ミリ秒） |

`multiple` 属性がない場合も `files` は FileList オブジェクトを返す（要素数が1のリスト）。

---

## 関連概念・周辺知識

- **React Hook Form**: バリデーション付きフォームの実装に使われるライブラリ（4章後半で扱う）。Uncontrolled Input ベースで再描画を最小化しつつ、検証機能を提供する。
- **スプレッド構文でのイミュータブル更新**: `{ ...form, key: newValue }` パターンは配列でも同様（`[...arr]` でコピー）。Stateを直接変更（ミューテート）すると React が変更を検知できず、再描画が起きない。
- **`e.target` vs `e.currentTarget`**: `e.target` はイベントが実際に発生した要素、`e.currentTarget` はハンドラーが登録された要素。フォームハンドラーでは基本的に `e.target` を使う。
- **アクション（8-3節）**: React の新しいフォーム管理パラダイム。本節の State ベースアプローチの代替。
