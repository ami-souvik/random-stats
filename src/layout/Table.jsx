import { useDispatch, useSelector } from 'react-redux';
import { deleteQuestion } from '../store/slice/dataSlice';

export default function Table() {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.data.questions);
  const generation = useSelector((state) => state.data.generation);
  const prefix = [
    { title: 'Full Name' },
    { title: 'Email' },
    { title: 'Please specify your gender' },
  ];
  return (
    <table>
      <thead>
        <tr>
          {[...prefix, ...questions].map((q, idx) => (
            <th key={idx} className="w-48 text-left px-2 py-1 border">
              <div className="flex items-center space-x-2">
                <div className="w-48">{q.title}</div>
                <div
                  className="cursor-pointer"
                  onClick={() => dispatch(deleteQuestion(idx - prefix.length))}
                >
                  <p className="rounded text-xl m-1 p-1 bg-slate-200">✖️</p>
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {generation.map((r, rIdx) => (
          <tr key={rIdx}>
            {r.map((v, vIdx) => (
              <td key={vIdx} className="px-2 py-1 border">
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
