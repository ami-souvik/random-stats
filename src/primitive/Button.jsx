export default function Button({ onClick, children }) {
    return <button className="py-2 px-6 bg-slate-700" onClick={onClick}>
        <p className="text-slate-100">{children}</p>
    </button>
}