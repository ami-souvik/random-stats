import { useForm } from "react-hook-form";
import Input from "../primitive/Input";
import InputArea from "../primitive/InputArea";
import Button from "../primitive/Button";
import { useDispatch } from "react-redux";
import { setQuestions } from "../store/slice/dataSlice";

export default function QForm() {
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const onSubmit = (data) => {
    data.choices = data.choices.split("\n")
    dispatch(setQuestions(data))
  }
  return <div className="flex flex-col space-y-2">
    <p>Question</p>
    <Input name="title" control={control} />
    <p>Multiple Choices</p>
    <InputArea name="choices" control={control} />
    <Button onClick={handleSubmit(onSubmit)}>Add</Button>
  </div>
}