import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import QForm from "./layout/QForm";
import Input from "./primitive/Input";
import Button from "./primitive/Button";
import { generateRandomStats } from "./helpers/generator";
import { setGeneration } from "./store/slice/dataSlice";
import Table from "./layout/Table";

export default function Root() {
    const dispatch = useDispatch();
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const questions = useSelector((state) => state.data.questions);
    const prefix = [{ title: "Full Name" }, { title: "Email" }, { title: "Please specify your gender" }]
    const generation = useSelector((state) => state.data.generation);
    const generate = ({ count }) => {
        dispatch(setGeneration(generateRandomStats(questions, Number(count))))
    }
    const download = (data) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'download.csv';
        a.click();
    }
    const csvmaker = () => {
        const csvRows = [];
        csvRows.push([...prefix, ...questions].map(q => q.title).join(','));
        generation.forEach(row => {
            csvRows.push(row.join(','))
        })
        return csvRows.join('\n');
    }
    const handleDownload = () => {
        const csv = csvmaker();
        download(csv);
    }
    return <div className="mx-6 my-2">
        <div className="flex space-x-2">
            <div className="flex-1">
                <QForm />
            </div>
            <div className="flex-1 space-y-2">
                <p>Generate Random Statistics</p>
                <div className="flex space-x-2">
                    <Input name={"count"} control={control} />
                    <Button onClick={handleSubmit(generate)}>Generate</Button>
                </div>
            </div>
        </div>
        <div className="relative my-2">
            <div className="absolute top-2 right-4 cursor-pointer text-4xl"
                onClick={handleDownload}>⬇️</div>
            <div className="border border-slate-700 overflow-auto">
                <Table />
            </div>
        </div>
    </div>
}