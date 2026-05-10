import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import yup from './ErrorMessage.tsx';
import './FormBasic.css';

// yup.addMethodで追加した独自メソッドを型レベルにも宣言する（モジュール拡張）
declare module 'yup' {
    interface StringSchema {
        ng(): this;
    }
}

type Gender = 'male' | 'female';

type FormValues = {
    name: string;
    email: string;
    gender: Gender;
    memo: string;
};

const NG_WORDS = ['tomorrow', 'yesterday'];

yup.addMethod(yup.string, 'ng', function () {
    return this.test(
        'ng',
        ({ label }) => `NG words are included in ${label}. (yup)`,
        (value) => !value || !NG_WORDS.some(w => value.includes(w)),
    );
});

// .default() / .ensure() は付けない（Yupの入力型をoptional化してyupResolverと衝突するため。
//  defaultValuesは useForm 側で渡しているので不要）
// 慣習として transform → validation の順でチェーン（Yup自体は順不同で実行するが可読性のため）
const schema: yup.ObjectSchema<FormValues> = yup.object({
    name: yup.string()
        .label('Name')
        .trim().lowercase()
        .required()
        .max(20),
    gender: yup.mixed<Gender>()
        .label('Gender')
        .oneOf(['male', 'female'] as const)
        .required(),
    email: yup.string()
        .label('Email')
        .trim().lowercase()
        .required()
        .email(),
    memo: yup.string()
        .label('Memo')
        .required()
        .min(10)
        .ng(),
}).required();

const DEFAULT_VALUES: FormValues = {
    name: 'nanashi',
    email: 'aaa@example.com',
    gender: 'male',
    memo: '',
};

export default function FormBasic() {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: DEFAULT_VALUES,
        // yupResolverの3番目のジェネリック（schema入力型）が optional 化されてuseFormと噛み合わないので、
        // 明示的にResolver<FormValues>へキャストする
        resolver: yupResolver(schema) as Resolver<FormValues>,
        // 入力のたびに検証してerrorsをリアルタイムに反映する
        mode: 'onChange',
    });

    const onsubmit: SubmitHandler<FormValues> = (data) =>
        // ダミーの遅延処理：実プロジェクトではAPI呼び出しに置き換える
        new Promise<void>((resolve) => {
            setTimeout(() => {
                console.log(data);
                alert(`${data.name} ${data.email} ${data.gender} ${data.memo}`);
                resolve();
            }, 4000);
        }
    );

    return (
        <form onSubmit={handleSubmit(onsubmit)} noValidate>
            <div>
                <label htmlFor="name">Name:</label><br />
                <input id="name" type="text" {...register('name')} />
                <div className="error">{errors.name?.message}</div>
            </div>

            <div>
                <label>Gender:</label><br />
                <label>
                    <input id="male" type="radio" value="male" {...register('gender')} />Man
                </label>
                <label>
                    <input id="female" type="radio" value="female" {...register('gender')} />Woman
                </label>
                <div className="error">{errors.gender?.message}</div>
            </div>

            <div>
                <label htmlFor="email">Mail Address:</label><br />
                <input id="email" type="email" {...register('email')} />
                <div className="error">{errors.email?.message}</div>
            </div>

            <div>
                <label htmlFor="memo">Memo:</label><br />
                <textarea id="memo" {...register('memo')} />
                <div className="error">{errors.memo?.message}</div>
            </div>

            <button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
                Send
            </button>
            {isSubmitting && <div>...Sending...</div>}
        </form>
    );
}
