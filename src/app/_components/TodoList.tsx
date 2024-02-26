"use client";
import { FormEvent, useState } from "react";
import { trpc } from "../_trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ScaleLoader } from "react-spinners";
import { PlusCircle } from "lucide-react";

export default function TodoList() {
  const getTodosQuery = trpc.getTodos.useQuery();
  const addTodoMutation = trpc.addTodo.useMutation({
    onSettled: () => {
      getTodosQuery.refetch();
    },
  });

  const [content, setContent] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [doneSearch, setDoneSearch] = useState("");

  const handleAddTodo = async () => {
    await addTodoMutation.mutateAsync(content);
    setContent("");
    toast("To do has been added", {
      description: "Your todo has been set!",
    });
  };

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    getTodosQuery.refetch();
  };

  const filteredTodos = getTodosQuery.data?.filter((todo) => {
    const doneSearchLower = doneSearch?.toLowerCase();
    return (
      (!contentSearch || todo.content?.includes(contentSearch)) &&
      (doneSearchLower === null ||
        doneSearchLower === "" ||
        (doneSearchLower === "true" && todo.done === 1) ||
        (doneSearchLower === "false" && todo.done === 0))
    );
  });

  return (
    <div>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <form
            className="flex items-center gap-2"
            onSubmit={handleFilterSubmit}
          >
            <Input
              name="contentSearch"
              placeholder="Content"
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
            />
          </form>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Todo</DialogTitle>
                <DialogDescription>Add a new item on list</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">
                    Content
                  </Label>
                  <Input
                    id="content"
                    className="col-span-3"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleAddTodo}>
                  Add Todo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getTodosQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <ScaleLoader color={"#123abc"} loading={true} />
                  </TableCell>
                </TableRow>
              ) : (
                filteredTodos?.map((todo) => (
                  <TableRow key={todo.id}>
                    <TableCell>{todo.id}</TableCell>
                    <TableCell>{todo.content}</TableCell>
                    <TableCell>{todo.done ? "Done" : "To do"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
