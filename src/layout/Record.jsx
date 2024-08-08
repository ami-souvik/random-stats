import { useDispatch } from "react-redux"
import { deleteQuestion } from "../store/slice/dataSlice"

export default function Record({ values=[] }) {
    const dispatch = useDispatch();
    return <div className="flex">
        {values.map((item, idx) =>
            <div className="flex items-center space-x-2 border border-slate-400 pl-6 pr-2">
                <div className="w-48">{item?.split("\n").map(l => <p>{l}</p>)}</div>
                <div className="cursor-pointer" onClick={() => dispatch(deleteQuestion(idx))}>
                    <p className="rounded text-xl m-1 p-1 bg-slate-200">✖️</p>
                </div>
            </div>
        )}
    </div>
}