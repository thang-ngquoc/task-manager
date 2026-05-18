import { Input } from "../ui/input";

export default function TaskFilters() {
    return (
        <div>
            <Input placeholder="Search tasks..." />

            <select>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Done</option>
            </select>

            <select>
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
        </div>
    )
}