# 4-3 検証機能の実装 - React Hook Form

## なぜフォームライブラリが必要か

入力値の検証は **セキュリティ対策の一環**（不正値を水際で止める）であり、毎回似たコードを書くのは面倒。信頼性のためにも独自性が不要な部分は既製のライブラリに頼るべき。

React の検証ライブラリは多数あるが、本書（および本ノート）では **React Hook Form** を扱う。理由：
- フックベースで設計されている（React 流の API）
- Yup・Zod・MUI 等の外部ライブラリと密に連携できる
- **非制御コンポーネント** をベースにしているため再レンダー回数が極小

```bash
npm install react-hook-form
```

### 制御 vs 非制御 — React Hook Form の設計思想

| 観点 | 制御コンポーネント (`useState` ベース) | 非制御コンポーネント (RHF) |
|------|----------------------------|----------------------|
| 状態の保持 | React State | DOM 自身（`ref` 経由で参照） |
| 値の更新検知 | `onChange` ごとに再レンダー | 必要なときだけ React が値を読みに行く |
| 再レンダー回数 | 入力1文字ごとに該当コンポーネントが再レンダー | キーストロークでは原則再レンダーしない |
| 実装の簡潔さ | ボイラープレート多め | `register` で一括登録 |

RHF が「速い」「軽い」と言われるのはこの設計のため。Formik など制御ベースのライブラリと最も大きく異なる点。

---

## 4-3-1 React Hook Form の基本

### 全体像（TypeScript）

```tsx
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import './FormBasic.css';

type FormValues = {
  name: string;
  email: string;
  gender: 'male' | 'female';
  memo: string;
};

export default function FormBasic() {
  // 既定値
  const defaultValues: FormValues = {
    name: '名無権兵衛',
    email: 'admin@example.com',
    gender: 'male',
    memo: '',
  };

  // フォームを初期化
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  // サブミット時の処理
  const onsubmit: SubmitHandler<FormValues> = data => console.log(data);
  const onerror: SubmitErrorHandler<FormValues> = err => console.log(err);

  return (
    <form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
      <div>
        <label htmlFor="name">名前：</label><br />
        <input id="name" type="text"
          {...register('name', {
            required: '名前は必須入力です。',
            maxLength: { value: 20, message: '名前は20文字以内にしてください。' },
          })}
        />
        <div className="error">{errors.name?.message}</div>
      </div>

      <div>
        <label>性別：</label><br />
        <label>
          <input id="male" type="radio" value="male"
            {...register('gender', { required: '性別は必須です。' })} />男性
        </label>
        <label>
          <input id="female" type="radio" value="female"
            {...register('gender', { required: '性別は必須です。' })} />女性
        </label>
        <div className="error">{errors.gender?.message}</div>
      </div>

      <div>
        <label htmlFor="email">メールアドレス：</label><br />
        <input id="email" type="email"
          {...register('email', {
            required: 'メールアドレスは必須入力です。',
            pattern: {
              value: /^[a-z\d._%+]+@[a-z\d-]+(?:\.[a-z\d-]+)*\.[a-z]{2,}$/i,
              message: 'メールアドレスの形式が不正です。',
            },
          })}
        />
        <div className="error">{errors.email?.message}</div>
      </div>

      <div>
        <label htmlFor="memo">備考：</label><br />
        <textarea id="memo"
          {...register('memo', {
            required: '備考は必須入力です。',
            minLength: { value: 10, message: '備考は10文字以上にしてください。' },
          })}
        />
        <div className="error">{errors.memo?.message}</div>
      </div>

      <div>
        <button type="submit">送信</button>
      </div>
    </form>
  );
}
```

### useForm 関数

`useForm<T>(opts)` でフォームを初期化する。型引数 `T` を渡すことで **`register` の `name` がリテラルユニオンで補完**され、`errors` も型付けされる。

主なオプション：

| オプション | 概要 |
|---|---|
| `defaultValues` | 各フィールドの既定値 |
| `mode` | 検証を実行するタイミング（`onChange`/`onBlur`/`onSubmit`/`onTouched`/`all`、既定 `onSubmit`） |
| `reValidateMode` | サブミット後にエラーが残ったときの再検証タイミング（既定 `onChange`） |
| `criteriaMode` | エラーをどう保持するか（`firstError`/`all`、既定 `firstError`） |
| `shouldUseNativeValidation` | ブラウザ既定の検証を使うか（既定 `false`） |
| `shouldFocusError` | 送信時にエラー箇所へフォーカス移動するか（既定 `true`） |
| `delayError` | エラーを表示するまでの遅延（ms） |
| `resolver` | 外部検証ライブラリ（Yup/Zod 等）を組み込む関数 |

戻り値（よく使うもの）：

| メンバー | 概要 |
|---|---|
| `register` | フォーム要素にイベントハンドラ・参照を登録 |
| `handleSubmit(onSuc, onErr)` | サブミット時のハンドラを設定 |
| `formState` | フォームの状態（4-3-3 で詳述） |
| `watch(name)` | 指定フィールドの値を取得しつつ変更を監視 |
| `getValues(name)` | 指定フィールドの値を取得（再レンダーは起こさない） |
| `reset(values)` | フォーム値をリセット |
| `setValue(name, value)` | 指定フィールドに値を設定 |
| `setError(name, error)` | 指定フィールドにエラーを紐づけ |
| `clearErrors(name)` | エラーをクリア |
| `setFocus(name)` | 指定フィールドにフォーカス |
| `getFieldState(name)` | `isDirty` / `isTouched` / `invalid` / `error` を取得 |
| `trigger(name)` | プログラム的に検証を実行 |
| `control` | 外部コンポーネント連携用（`Controller` で使う） |

### なぜそう設計されているか・補足

- **`register('name')` がスプレッドで展開される構文**は、内部的には `{ onChange, onBlur, ref, name }` の 4 プロパティを返している。`<input {...register('name', {...})} />` は意味的に：
  ```ts
  const { onChange, onBlur, ref, name } = register('name', { ... });
  return <input id="name" type="text" onChange={onChange} onBlur={onBlur} ref={ref} name={name} />;
  ```
  と等価。**`ref` に注目** — React Hook Form は input に `ref` を取り付けて DOM から値を直接読む（非制御）からこそ、軽量かつ高速。
- `noValidate` をつけているのは、ブラウザ標準の HTML5 バリデーションを抑止するため。RHF と二重に走るのを防ぐ。
- `errors.name?.message` の `?.` は Optional Chaining。エラーが無い時に `errors.name` は `undefined` なので、それでも `.message` を踏まずに済む。

### 実践上の注意点・アンチパターン

- **`register('gender', ...)` をラジオボタンの片方にだけ書いてはいけない** — 両方の `<input type="radio">` に同じ `register('gender', ...)` を付けると、RHF はそれらを「1 つの gender フィールドに紐づく複数の input」として扱う。正解は本書のサンプルどおり**両方に書く**（ただし最近のバージョンでは1個でも動く）。
- **既定値の型はスキーマと完全一致させる**。`defaultValues: { name: undefined }` のような中途半端な指定は、後段で `string` 期待の場所で型エラーや実行時バグを生む。
- **TS で `register` する際の型推論を効かせるには `useForm<FormValues>()` と書く**。書かないと `name` の補完が効かず、ミス時にも気づきにくい。

### handleSubmit 関数

`handleSubmit(onsubmit, onerror)` を `<form onSubmit>` に渡す。

- **`onsubmit`**: 検証成功時に呼ばれる。引数 `data` がフォーム値（型は `T`）、`e` がイベント。
- **`onerror`**: 検証失敗時に呼ばれる。引数 `error` がエラー情報。

```ts
const onsubmit: SubmitHandler<FormValues> = (data, e) => {
  // data の型は FormValues として推論される
  console.log(data);
};
```

`SubmitHandler<T>` / `SubmitErrorHandler<T>` を使うと型注釈が綺麗。

### errors オブジェクトの構造

```
errors
  └─ フィールド名*
       ├─ type      （検証の種類: "required" / "maxLength" など）
       ├─ ref       （対象要素への参照）
       └─ message   （エラーメッセージ）
```

`errors.name?.message` のように Optional Chaining でアクセス。

```ts
type Errors = {
  [K in keyof FormValues]?: {
    type: string;
    message: string;
    ref?: HTMLElement;
  };
};
```

---

## register 関数のオプション

`register(name, opts)` の `opts` は **基本** / **検証** / **変換** の 3 種類に大別される。

### 基本

| オプション | 概要 |
|---|---|
| `value` | 入力値 |
| `disabled` | 入力要素を無効化（既定 `false`） |
| `onChange` | change イベントハンドラ |
| `onBlur` | blur イベントハンドラ |

### 検証

| オプション | 概要 |
|---|---|
| `required` | 必須検証（true / false / メッセージ） |
| `maxLength` / `minLength` | 最大／最小文字列長 |
| `max` / `min` | 最大値／最小値（数値・日付） |
| `pattern` | 正規表現マッチ |
| `validate` | 検証関数（4-3-2） |

### 変換

| オプション | 概要 |
|---|---|
| `valueAsNumber` | 入力値を Number として返す |
| `valueAsDate` | 入力値を Date として返す |
| `setValueAs` | 任意の変換関数 |

### 検証ルールの宣言形式

- **パラメータなし**: `required: 'メッセージ'`
- **パラメータあり**: `maxLength: { value: 20, message: 'メッセージ' }`

```ts
{...register('name', {
  required: '名前は必須です。',                                    // パラメータなし
  maxLength: { value: 20, message: '20文字以内' },                 // パラメータあり
})}
```

### なぜそう設計されているか・補足

- `valueAsNumber` を使うと、`<input type="number">` の値が `string` ではなく `number` として `data` に入る。**TypeScript 視点だとこれは重要**で、フォーム値の型を `{ age: number }` と書きたいなら必ず `valueAsNumber: true` を付ける。
- `setValueAs: v => v.trim()` のような前処理はここでも書けるが、複数のルールに流用したい場合は Yup の `transform` のほうが整理しやすい（4-3-6）。

### 実践上の注意点・アンチパターン

- **`required: true` だけ書くとエラーメッセージが空になる**。文字列を渡すか `{ value: true, message: '...' }` 形式で。
- **`pattern` は `RegExp` を直接渡す**。メールアドレスのような自前正規表現はバグの温床になりやすいので、Yup の `email()` などに任せるほうが安全。

---

## 4-3-2 独自の検証ルールを実装する

組み込みのルールで足りない場合、`validate` オプションで関数を渡せる。

```tsx
type FormValues = {
  memo: string;
  /* ... */
};

<textarea id="memo"
  {...register('memo', {
    required: '備考は必須入力です。',
    validate: {
      ng: (value, formValues) => {
        const ngs = ['暴力', '死', 'グロ'];
        return ngs.some(ng => value.includes(ng))
          ? '備考にNGワードが含まれています。'
          : true;  // 検証成功は true、失敗はエラーメッセージ（または false）
      },
    },
  })}
/>
```

### validate 関数のルール

- **引数**: `(value, formValues)` — 当該フィールドの値と、フォーム全体の値
- **戻り値**: 成功時 `true`、失敗時 `false` または **エラーメッセージ文字列**（`Promise` も可で非同期検証もできる）

```ts
type Validator<TFieldValue, TFormValues> = (
  value: TFieldValue,
  formValues: TFormValues,
) => boolean | string | Promise<boolean | string>;
```

### 単一ルールしかない場合

`validate` に直接関数を渡してもよい：
```ts
validate: (value, formValues) => /* ... */
```
複数ルールある場合だけ `{ ng: ..., other: ... }` のオブジェクト形式にする。

### なぜそう設計されているか・補足

- `formValues` を引数で受け取れるので、**フィールド間検証**（パスワードと確認用パスワードが一致するか、終了日が開始日より後か等）が書ける。
- 非同期可なので、サーバ側のユニーク性チェック（このメールアドレスはすでに登録されているか？）も同じ仕組みで実装できる：
  ```ts
  validate: async (value) => {
    const r = await fetch(`/api/check-email?email=${value}`);
    return r.ok || 'このメールアドレスは登録済みです';
  }
  ```

### 実践上の注意点・アンチパターン

- 非同期検証では **`mode: 'onBlur'` か `mode: 'onChange'` + デバウンス** を検討。サブミット時だけだとユーザ体験が悪く、毎キーストロークだとサーバ負荷が高い。
- **NGワード判定は本気でやるなら正規化が必要**。「暴 力」のように空白を挟まれたり、「ぼうりょく」のような表記揺れに対応するなら、Yup の `transform` で前処理するか、サーバ側で判定する。

---

## 4-3-3 フォームの状態に応じて表示を制御する

`formState` オブジェクトを参照することで、フォームの状態（送信中・変更済み・有効など）を検知できる。

### formState の主なメンバー

| プロパティ | 概要 |
|---|---|
| `isDirty` | ユーザーがいずれかの要素を変更したか |
| `dirtyFields` | 変更されたフィールド情報（`{ name: true, ... }`） |
| `touchedFields` | 操作したフィールド情報（`{ name: true, ... }`） |
| `defaultValues` | useForm で設定した既定値 |
| `isSubmitted` | フォームが送信されたか |
| `isSubmitSuccessful` | フォームが正常に送信されたか |
| `isSubmitting` | フォームの送信中であるか |
| `isLoading` | 非同期 defaultValues をロード中か |
| `submitCount` | フォームが送信された回数 |
| `isValid` | 入力値が正しいか |
| `isValidating` | 検証中であるか |
| `errors` | エラー情報 |

### 例：入力済み & 検証OK のときだけ送信ボタンを有効化

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isDirty, isValid, isSubmitting },
} = useForm<FormValues>({ /* ... */ });

const onsubmit: SubmitHandler<FormValues> = data => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
      console.log(data);
    }, 4000);
  });
};

return (
  <form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
    {/* ...各フィールド... */}
    <button type="submit"
      disabled={!isDirty || !isValid || isSubmitting}>送信</button>
    {isSubmitting && <div>...送信中...</div>}
  </form>
);
```

- `isDirty` が false（未編集）または `isValid` が false（検証エラー）または `isSubmitting`（送信中）→ ボタン無効
- `onsubmit` が `Promise` を返すと、その resolve まで `isSubmitting` が `true` のまま

### なぜそう設計されているか・補足

- **`isDirty` と `touched` は意味が違う**:
  - `isDirty` = 値が変更された
  - `isTouched` = フォーカスして外した（blur した）
  - 「触ってない・空欄」の表示と「触ったが空のまま」のメッセージを分けたい時に使い分ける。
- **`isSubmitting` の自動管理は地味に強力**。`useState<boolean>` を自前で持って try/finally で切り替える…という典型的ボイラープレートを RHF が肩代わりしてくれる。
- **`formState` のプロパティはアクセスされたものだけ購読される**（Proxy 経由）。`isValid` を読んでいないコンポーネントは、`isValid` が変化しても再レンダーしない。これが RHF の高速性の一端。

### 実践上の注意点・アンチパターン

- **「最初から送信ボタン無効」は UX として注意**。何が足りないかを別途表示しないと、ユーザは詰まる。理想は「クリックは許して、エラー箇所へスクロール&フォーカス」する設計。RHF の `shouldFocusError: true`（既定）はそれをサポート。
- **`isValid` は `mode` の設定により挙動が変わる**。既定の `mode: 'onSubmit'` だと、初回サブミットまでは `isValid` が信頼できない（検証が走っていないから）。送信前から `isValid` を見たいなら `mode: 'onChange'` か `'onBlur'` にする。

### 📌 ハマりどころ：`mode` を指定しないと `errors` が「効かない」ように見える

`<div className="error">{errors.hoge?.message}</div>` を書いたのに、入力中はずっと空のまま——というのは **`mode` 既定値（`'onSubmit'`）の典型的な誤解**。

| タイミング | 既定（`onSubmit`）の挙動 | `errors` 表示 |
|---|---|---|
| 初回ロード | 検証なし | 空 |
| 入力中 | 検証なし | **空のまま**（「効いてない」と誤解する瞬間） |
| 送信ボタンclick | 検証実行 → `errors` populate | 表示される |
| 以降の入力 | `reValidateMode: 'onChange'`（既定）で更新 | 都度更新 |

つまり「入力するたびにエラーをリアルタイム表示したい」のなら `mode: 'onChange'`（または `'onBlur'`/`'onTouched'`）を**必ず**指定する必要がある。

```ts
useForm<FormValues>({
  defaultValues,
  resolver: yupResolver(schema) as Resolver<FormValues>,
  mode: 'onChange',   // ← これがないと errors はサブミットまで空
});
```

`disabled={!isDirty || !isValid}` で送信ボタンを抑止するパターンも、`mode: 'onSubmit'` のままだと **初回サブミットまで `isValid` が無条件 `true`** なので、ガードとしてほぼ意味をなさない。`mode` を入れて初めて期待通りの挙動になる。

---

## 4-3-4 検証ライブラリと連携する（Yup）

組み込みの検証ルールだけだと、`register` 内に検証ルールが散らばってコード見通しが悪い。**スキーマ宣言型のライブラリ**と組み合わせると、ルールを 1 か所に集約できる。

連携可能なライブラリ：

| ライブラリ | 特徴 |
|---|---|
| **Yup** | 古参で安定、メソッドチェーン記法 |
| **Zod** | TypeScript ファースト、型推論が強力（**現在主流**） |
| **Joi** | サーバ側でも使えるが React Hook Form 連携はオマケ気味 |
| **Vest** | テスト風（describe/it 似）の DSL |
| **Ajv** | JSON Schema ベース |

```bash
npm install @hookform/resolvers yup
```

### Yup でスキーマを宣言

```ts
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 検証ルールを準備
const schema = yup.object({
  name: yup
    .string()
    .label('名前')
    .required('${label}は必須入力です。')
    .max(20, '${label}は${max}文字以内で入力してください。'),
  gender: yup
    .string()
    .label('性別')
    .required('${label}は必須入力です。'),
  email: yup
    .string()
    .label('メールアドレス')
    .required('${label}は必須入力です。')
    .email('${label}の形式が不正です。'),
  memo: yup
    .string()
    .label('備考')
    .required('${label}は必須入力です。')
    .min(10, '${label}は${min}文字以上で入力してください。'),
});

// スキーマから型を生成（TS の利点）
type FormValues = yup.InferType<typeof schema>;

export default function FormYup() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '名無権兵衛',
      email: 'admin@example.com',
      gender: 'male',
      memo: '',
    },
    resolver: yupResolver(schema),  // Yupに検証を委ねる
  });

  const onsubmit: SubmitHandler<FormValues> = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onsubmit)} noValidate>
      <div>
        <label htmlFor="name">名前：</label><br />
        <input id="name" type="text" {...register('name')} />
        <div className="error">{errors.name?.message}</div>
      </div>
      {/* ...他フィールド: register に検証ルールを書かない... */}
    </form>
  );
}
```

`register('name')` から検証ルールが消えていることに注目。スキーマ側に集約された。

### 📌 ハマりどころ：`resolver` 設定時、`register` のインライン検証ルールは **完全に無視される**

下のように書いてもルールは効かない。スキーマだけが効く。

```tsx
// resolver: yupResolver(schema) を設定済み

<input {...register('name', {
  required: 'Name is required.',                   // ← 完全に無視される
  maxLength: { value: 20, message: 'too long' },   // ← 完全に無視される
})} />
```

`required: 'メッセージ'` を併記したくなる気持ちは分かるが、**死コード**になり、
- 「メッセージを変えたのに表示が変わらない」
- 「`maxLength` を緩めたのに依然エラーが出る」
といった保守時の混乱を招く。**`resolver` を入れたら `register('name')` だけにする**のが鉄則。検証は単一の源泉（スキーマ）に集約する。


### スキーマの構文

```
フィールド名: yup
  .データ型()
  .label('日本語名')
  .検証ルール(...).~
```

### Yup のデータ型と主な検証ルール

| データ型 | 検証ルール | 内容 |
|---|---|---|
| `mixed` | `required()` | 値が入力されているか |
|        | `oneOf(array)` | 値リストのいずれか（`${values}`） |
| `string` | `length(num)` | 指定の長さちょうどか（`${length}`） |
|         | `max(num)` / `min(num)` | 文字列長（`${max}` / `${min}`） |
|         | `email()` | メールアドレス形式 |
|         | `url()` | URL 形式 |
|         | `matches(pattern)` | 正規表現マッチ |
| `number` | `max(num)` / `min(num)` | 数値範囲 |
|         | `lessThan` / `moreThan` | 未満／超過 |
|         | `integer()` / `positive()` / `negative()` | 整数／正／負 |
| `boolean` | （固有ルールなし） | |
| `date` | `min(dat)` / `max(dat)` | 日付以降／以前 |
| `array` | `length` / `max` / `min` | 配列長 |

エラーメッセージ内では `${label}` `${max}` のようなプレースホルダーが使える。

### Zod 版（現代的な代替案）

```ts
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, '名前は必須です').max(20, '名前は20文字以内'),
  email: z.string().email('メールアドレスの形式が不正です'),
  gender: z.enum(['male', 'female']),
  memo: z.string().min(10, '備考は10文字以上'),
});
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

**Zod のほうが TypeScript との親和性が高い**（`z.enum`、ユニオン、判別ユニオンが自然）ので、新規プロジェクトではこちらを推奨。

### なぜそう設計されているか・補足

- スキーマ駆動の利点：
  - **検証ルールが1か所**に集まり、視認性が劇的に向上する
  - **サーバとフロントで同じスキーマ**を共有可能（Zod はサーバ側でも使える）
  - **型情報を自動生成**できる（`yup.InferType` / `z.infer`）→ 二重定義を防ぐ
- React Hook Form と外部スキーマの橋渡しが `resolver`。`@hookform/resolvers` パッケージに各ライブラリ用が揃っている。

### 実践上の注意点・アンチパターン

- **`required()` を書き忘れた optional フィールドは `string | undefined`** になる。型と検証の整合性をスキーマだけで担保すること。
- **Yup より Zod**: 現代の TypeScript プロジェクトでは Zod が主流。Yup は歴史的経緯で残っているが、新規採用は Zod を強く推奨（型推論の精度・エラーメッセージのカスタマイズ性ともに上）。
- **スキーマを巨大化させない**。フィールドが20を超えるようなら、フォームを分割するか `z.object({...}).extend(...)` で部品化する。

### TypeScript で Yup + RHF を組むときに必ず踏む型エラー

`yup.ObjectSchema<FormValues>` を明示しつつ `useForm<FormValues>` に渡すと、**ほぼ確実に**以下の型エラーが出る：

```
型 'Resolver<FormValues, any, { name?: string; ... }>' を
型 'Resolver<FormValues, any, FormValues>' に割り当てることはできません。
  プロパティ 'name' は型 '{ name?: string; ... }' では省略可能ですが、
  型 'FormValues' では必須です。
```

#### 原因

React Hook Form の `Resolver<TFieldValues, TContext, TTransformedValues>` の **第3型引数**と、`yupResolver(schema)` の戻り値の第3型引数が噛み合わないため。

- `useForm<FormValues>` の `TTransformedValues` は既定で `FormValues`（required）
- 一方 `@hookform/resolvers/yup` は **スキーマの入力型**（cast 受け入れ型）を第3引数に入れる。`yup.ObjectSchema<T>` で T を明示すると、Yup 内部で入力型は `Maybe<Partial<T>>` 扱いになり、各フィールドが optional 化される

```ts
// yupResolverが返すResolver
Resolver<FormValues, any, { name?: string; email?: string; gender?: Gender; memo?: string; }>
//                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                         全フィールド optional（Yupの入力型）

// useForm<FormValues>が要求するResolver
Resolver<FormValues, any, FormValues>
//                        ^^^^^^^^^^
//                        required（TS型と一致）
```

さらに各フィールドに **`.default(...)` や `.ensure()` を付けるとこの傾向が強まる**（Yup が「入力時には省略可、cast 時にデフォルトが入る」と解釈するため）。

#### 解決策（推奨度順）

1. **`.default()` / `.ensure()` を Yup スキーマから外す**
   - `useForm` の `defaultValues` で初期値を渡しているなら、Yup 側のデフォルトは**無意味かつ有害**
   - これだけで解消することも多い

2. **resolver を明示的にキャストする**
   ```ts
   import { useForm, type Resolver } from 'react-hook-form';

   const { register, handleSubmit } = useForm<FormValues>({
     defaultValues,
     resolver: yupResolver(schema) as Resolver<FormValues>,
   });
   ```
   ランタイム挙動は変わらない。型表現の差異を埋めるだけのキャスト。

3. **スキーマ側を起点に型を導出する**
   ```ts
   const schema = yup.object({...}).required();
   type FormValues = yup.InferType<typeof schema>;
   ```
   `yup.ObjectSchema<FormValues>` の明示注釈を捨て、スキーマから型を生やす。型と検証ルールの単一の源泉になり、二重定義による不整合も防げる。**新規ならこれが最もクリーン**。

4. **Zod に乗り換える**
   - そもそもこの不整合は Yup 特有。Zod + `zodResolver` ではきれいに型が通る。新規プロジェクトで悩むくらいなら最初から Zod。

#### `gender: 'male' | 'female'` のような狭い型を維持したいときの定型句

```ts
type Gender = 'male' | 'female';
const schema = yup.object({
  gender: yup
    .mixed<Gender>()
    .oneOf(['male', 'female'] as const, '${label} is required')
    .required(),
  // ...
});
```

`yup.string()` だと `string` にしかならないので、リテラルユニオンを保ちたいなら `yup.mixed<T>().oneOf([...] as const)` を使う。`as const` を付けないと配列の要素型が `string` に広がってしまう。

#### 📌 `mixed<T>` だけだとランタイム保護はゼロ

`yup.mixed<Gender>().required()` と書いただけでは、**TypeScript の型上で** `Gender` を期待するだけで、ランタイムでは「null/undefined 以外なら何でも通る」状態になる。

```ts
// ❌ ランタイム保護がない（型は Gender だが実態は any 同然）
gender: yup.mixed<Gender>().required(),

// ✅ oneOf で実値を絞る
gender: yup.mixed<Gender>().oneOf(['male', 'female'] as const).required(),
```

`defaultValues.gender = 'male'` のように常に正しい値が入っているなら表面化しないが、フォームが拡張されたり API レスポンスを `reset()` で流し込んだりした瞬間にバグる。**`mixed<T>` を使ったら `oneOf` をセットで書く**を反射的に身につけたい。

---

## 4-3-5 Yup で独自の検証ルールを実装する

### test メソッド（インライン定義）

```ts
const schema = yup.object({
  memo: yup
    .string()
    .label('備考')
    .required('${label}は必須入力です。')
    .min(10, '${label}は${min}文字以上で入力してください。')
    .test(
      'ng',                                         // 検証名
      ({ label }) => `${label}にNGワードが含まれています`,  // メッセージ（関数可）
      value => {                                    // 検証ルール
        const ngs = ['暴力', '死', 'グロ'];
        return value === undefined || !ngs.some(ng => value.includes(ng));
      },
    ),
});
```

`test(name, message, func)` の構文：
- `name`: 検証名
- `message`: 文字列か **メッセージ関数**（検証コンテキストを引数で受け取る）
- `func`: 検証関数（`value => boolean`）

### 検証コンテキストのプロパティ

| プロパティ | 概要 |
|---|---|
| `label` | フィールド名 |
| `originalValue` | 変換前の値 |
| `value` | 変換後の値 |
| `spec` | 検証に関わる設定情報 |

### addMethod（汎用ルールとして切り出す）

複数フィールドで同じルールを使いたいときは `yup.addMethod` で再利用可能なメソッドを作る。

```ts
import * as yup from 'yup';

// 'ng' ルールを yup.string に追加
yup.addMethod(yup.string, 'ng', function () {
  return this.test(
    'ng',
    ({ label }) => `${label}にNGワードが含まれています。`,
    value => {
      const ngs = ['暴力', '死', 'グロ'];
      return value === undefined || !ngs.some(ng => value.includes(ng));
    },
  );
});

// 使う側
const schema = yup.object({
  memo: yup.string().label('備考').required().min(10).ng(),  // 自作ルール
});
```

### addMethod の構文

```
addMethod(type, name, method)
```

- `type`: データ型（`yup.string` / `yup.number` 等）
- `name`: 検証名
- `method`: 検証ルール

検証ルール（`method`）は：
1. **`function () { ... }` で定義する**（アロー関数は不可）
2. 戻り値は **Schema オブジェクトであること**（`this.test(...)` などを返す）

#### TS で `addMethod` を使うときの型拡張

`yup.addMethod(...)` は **ランタイムにメソッドを生やす**だけで、**型レベルには何も伝わらない**。そのため `yup.string().ng()` は `プロパティ 'ng' は型 'StringSchema<...>' に存在しません` と TS エラーになる。

これを解消するには **モジュール拡張（Module Augmentation）** が必要：

```ts
declare module 'yup' {
  interface StringSchema {
    ng(): this;  // ← 戻り値 this でチェーン継続を保証
  }
}
```

#### 📌 ハマりどころ：宣言の置き場所

- **同じファイル内に `addMethod` の呼び出し直前に書いてOK**。専用の `.d.ts` を作る必要は必須ではない
- ただし TypeScript は `declare module` のマージをグローバルに行うので、書く場所が `.ts/.tsx` ファイル内ならどこでも一度宣言すればプロジェクト全体に効く
- **複数ファイルから使う独自ルールが増えてきたら**、`yup-extensions.d.ts` のような専用ファイルに切り出して `tsconfig.json` の `include` に含めるのが定番

```ts
// FormBasic.tsx — 同じファイルに書いた例
import yup from './ErrorMessage';

declare module 'yup' {
  interface StringSchema {
    ng(): this;
  }
}

yup.addMethod(yup.string, 'ng', function () {
  return this.test('ng', /* ... */);
});

// 以降 yup.string().ng() が型としても通る
```

戻り値型に **polymorphic this** を使うのがコツ。`StringSchema` を直接書くと、`.required()` の後に `.ng()` を呼んだときに optional/required 等の Flag 型が崩れる。`this` なら呼び出した時点の Schema 型がそのまま伝播する。

### なぜアロー関数が不可なのか・補足

`function () { ... }` の `this` は呼び出し時に動的にバインドされ、Yup 内部で **Schema オブジェクトに `this` を束縛して呼び出している**。アロー関数は字句的に `this` を捕捉する（外側のスコープを引き継ぐ）ため、`this.test(...)` がそもそも呼べない。

これは Mocha / Jest のカスタムマッチャー登録など、**「ライブラリが `this` で API を提供する」場面で頻出するパターン**。覚えておくと他でも応用できる。

---

## 4-3-6 Yup で入力値を変換する

スキーマで **検証だけでなく値の変換**もできる。各データ型ごとの主な変換ルール：

| データ型 | 関数 | 概要 |
|---|---|---|
| 共通 | `label(name)` | 入力項目の表示名 |
|     | `default(value)` | 既定値 |
|     | `nullable()` | null を許容 |
| string | `trim()` | 前後の空白を除去 |
|        | `lowercase()` / `uppercase()` | 大小文字変換 |
| number | `truncate()` | 小数点以下切り捨て |
|        | `round(type)` | `'floor'`/`'ceil'`/`'trunc'`/`'round'` |

### 例：trim & lowercase

```ts
const schema = yup.object({
  name: yup
    .string()
    .label('名前')
    .trim().lowercase()              // ← 変換
    .required('${label}は必須入力です。')
    .max(20, '${label}は${max}文字以内で入力してください。'),
  /* ... */
});
```

### transform で自作変換

`transform((value, orgValue) => ...)` で独自変換も可能。

```ts
// 全角/半角の正規化（NFKC正規化）
const schema = yup.object({
  name: yup
    .string()
    .label('名前')
    .transform((value, orgValue) => value.normalize('NFKC'))
    .required('${label}は必須入力です。')
    .max(20, '${label}は${max}文字以内で入力してください。'),
});
```

### transform 関数のルール

- **引数**: `value`（ここまでの変換済み値）と `orgValue`（元の値）
- **戻り値**: 変換済みの値

### Unicode 正規化（NFKC）の補足

文字には**見た目は同じだが内部表現が違う**ものがある：
- 全角アルファベット `Ｗ` と半角 `W`
- 全角数字 `１` と半角 `1`
- 半角カナ `ｶ` と全角カナ `カ`
- 機種依存文字 `㈱`、`㌖`（ギガメートル）など

**NFKC**（Normalization Form Compatibility Composition）は、これらを「互換性のある形」に統一する正規化方式。たとえば：
- `㈱WＩＮＧＳﾌﾟﾛｼﾞｪｸﾄ` → `(株)WINGSプロジェクト`

データを DB や API に流す前に正規化しておくと、後続のマッチングや比較で表記ゆれに悩まされなくなる。

### 4種の Unicode 正規化形式（参考）

| 形式 | 意味 |
|---|---|
| NFC | 正準等価で**合成**（推奨デフォルト） |
| NFD | 正準等価で**分解** |
| NFKC | 互換等価で合成（**機種依存文字も統一**） |
| NFKD | 互換等価で分解 |

「互換」は見た目が同じものまで広く同一視する。検索・比較に使うなら NFKC が定番。

### 実践上の注意点・アンチパターン

- **変換は検証より先に走る**。`required()` チェックが trim 後の値で行われるので、空白だけの入力は弾ける。
- **VSCode + ESLint で `'orgValue' is defined but never used`** と警告される（本書 \*8）が、API 側で渡される第2引数を残しておきたいだけなら無視してよい。`_orgValue` のように prefix `_` をつけると ESLint の `no-unused-vars` を回避できる。

---

## 4-3-7 Yup のエラーメッセージをアプリで一元管理する

各フィールドにメッセージを書くと、メッセージの統一・保守が大変。`yup.setLocale` でアプリ全体のデフォルトメッセージを差し替える。

### yup.jp.ts（メッセージ定義）

```ts
import * as yup from 'yup';

const jpLocale = {
  mixed: {
    required: ({ label }: { label: string }) => `${label}は必須です。`,
    oneOf: ({ label, values }: { label: string; values: unknown }) =>
      `${label}は${values}のいずれかでなければなりません。`,
  },
  string: {
    length: ({ label, length }: { label: string; length: number }) =>
      `${label}は${length}文字ちょうどでなければなりません。`,
    min: ({ label, min }: { label: string; min: number }) =>
      `${label}は${min}文字以上でなければなりません。`,
    max: ({ label, max }: { label: string; max: number }) =>
      `${label}は${max}文字以下でなければなりません。`,
    matches: ({ label, regex }: { label: string; regex: RegExp }) =>
      `${label}は「${regex}」形式に一致していなければなりません。`,
    email: ({ label }: { label: string }) =>
      `${label}はメールアドレス形式でなければなりません。`,
    url: ({ label }: { label: string }) =>
      `${label}はURL形式でなければなりません。`,
  },
  number: {
    min: ({ label, min }: { label: string; min: number }) => `${label}は${min}以上でなければなりません。`,
    max: ({ label, max }: { label: string; max: number }) => `${label}は${max}以下でなければなりません。`,
    lessThan: ({ label, less }: { label: string; less: number }) => `${label}は${less}未満でなければなりません。`,
    moreThan: ({ label, more }: { label: string; more: number }) => `${label}は${more}より大きくなければなりません。`,
    positive: ({ label }: { label: string }) => `${label}は正数でなければなりません。`,
    negative: ({ label }: { label: string }) => `${label}は負数でなければなりません。`,
    integer: ({ label }: { label: string }) => `${label}は整数でなければなりません。`,
  },
  date: {
    min: ({ label, min }: { label: string; min: Date }) => `${label}は${min}より未来日でなければなりません。`,
    max: ({ label, max }: { label: string; max: Date }) => `${label}は${max}より過去日でなければなりません。`,
  },
};

yup.setLocale(jpLocale);
export default yup;
```

### 使う側（FormJapan.tsx）

```ts
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from './yup.jp';   // ← 大元の'yup'ではなく、設定済みのものをimport

const schema = yup.object({
  name: yup.string().label('名前').required().max(20),       // ← メッセージは省略
  gender: yup.string().label('性別').required(),
  email: yup.string().label('メールアドレス').required().email(),
  memo: yup.string().label('備考').required().min(10),
});
```

各 `.required()` `.email()` `.min(10)` から**メッセージ引数が消えている**ことに注目。`setLocale` で登録したメッセージが使われる。

### なぜそう設計されているか・補足

- **i18n の入り口**: 言語ごとに `yup.en.ts` `yup.jp.ts` `yup.ko.ts` を用意し、ランタイムで切り替えれば多言語対応の基盤になる。
- **保守性**: 「全フィールドのメッセージを丁寧語に揃える」「！を `.` に変える」といった文言の統一がスキーマを触らず1箇所で済む。
- **`setLocale` はグローバル副作用**。アプリ起動時の早いタイミングで（エントリポイントで）一度だけ呼ぶ。

### 実践上の注意点・アンチパターン

- **個別の `.required('カスタムメッセージ')` は setLocale より優先される**。例外的にこの項目だけ別文言にしたい場合に有効。
- **`yup.jp.ts` を import せずに `yup` を直接 import すると、setLocale が走らないまま使われる**ことがある。アプリのエントリで一度 import しておくと安全。
- **TS の型**: 上記の `({ label }: { label: string })` は本来 `MessageParams` 系の型を yup 自身が提供している（`{ path, value, originalValue, label, type, ... }`）。厳密にやるなら：
  ```ts
  import { setLocale, MessageParams } from 'yup';
  const required = ({ label }: MessageParams) => `${label}は必須です。`;
  ```

---

## 関連概念・周辺知識

### 制御コンポーネントが必要なケース：Controller

MUI の `<TextField>` や Material UI の DatePicker のように、**自前で `value`/`onChange` を持っている外部コンポーネント**は `register` だけでは制御できない。そういう時は `Controller` で橋渡しする。

```tsx
import { useForm, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const { control, handleSubmit } = useForm<FormValues>({...});

<Controller
  name="name"
  control={control}
  rules={{ required: '名前は必須です' }}
  render={({ field, fieldState }) => (
    <TextField {...field}
      error={!!fieldState.error}
      helperText={fieldState.error?.message} />
  )}
/>
```

`useForm` の戻り値の `control` を渡すのがポイント。

### React 19 の `useActionState` / `<form action>`

React 19 では、フォーム送信を **Server Actions** + `useActionState` で扱う設計が登場した。SSR・サーバ実行を前提とする場合、RHF + クライアント検証よりこちらが向くケースもある。

```tsx
const [state, formAction, isPending] = useActionState(serverAction, initialState);
return <form action={formAction}>...</form>;
```

ただし**インタラクティブな細かい検証 UX は RHF のほうが圧倒的に書きやすい**ので、当面は併用が現実的。

### ESM 環境での Yup vs Zod 選定基準

| 観点 | Yup | Zod |
|---|---|---|
| 歴史 | 古参 | 新興（2020〜） |
| 型推論 | `InferType<typeof schema>`（弱い場面あり） | `z.infer<typeof schema>`（最強） |
| 判別ユニオン | 苦手 | `z.discriminatedUnion()` で完全対応 |
| エラーメッセージ | `setLocale` でグローバル | `errorMap` でグローバル |
| バンドルサイズ | やや大きい | 小さい |
| 学習資料の量 | 多い | 急増中 |

**新規採用なら Zod**。既存プロジェクトで Yup が動いているなら、無理に乗り換えなくてもよい。

### React Hook Form のパフォーマンスがなぜ高いか

| 仕組み | 効果 |
|---|---|
| 非制御コンポーネント | キーストロークごとの再レンダーが発生しない |
| `formState` の Proxy 購読 | 使ってないプロパティの変更で再レンダーしない |
| ref ベースの値取得 | DOM から直接読む（State 経由しない） |
| `useFieldArray` の最適化 | 配列フォームでも要素単位で追跡 |

数百のフィールドがある巨大フォーム（業務系の決算入力画面など）でも実用的に動く。Formik では同条件で著しくパフォーマンス劣化することがある。
