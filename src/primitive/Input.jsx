import { Controller } from 'react-hook-form';

export default function Input({ control, name }) {
    return <Controller
      control={control}
      rules={{
        required: true,
      }}
      render={({ field: { onChange, onBlur, value } }) => 
        <input
          className="h-10 border border-slate-400"
          value={value}
          onBlur={onBlur}
          onChange={e => onChange(e.target.value)}
        />
      }
      name={name}
    />
}