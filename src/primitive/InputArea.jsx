import { Controller } from 'react-hook-form';

export default function InputArea({ control, name }) {
    return <Controller
        control={control}
        rules={{
        required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => 
            <textarea
                rows="10"
                className="border border-slate-400"
                value={value}
                onBlur={onBlur}
                onChange={e => onChange(e.target.value)}
            ></textarea>
        }
        name={name}
    />
}