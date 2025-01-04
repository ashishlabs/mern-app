export interface Todo {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: string[];
    userId: string;
    createdDate: string;
    dueDate: string;
}