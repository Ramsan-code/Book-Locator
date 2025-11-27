"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { booksApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  price: z.string().min(1, "Price is required"), // Handling as string for input, convert to number
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export default function CreateBookPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      price: "",
      category: "",
      condition: "",
      image: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) return;
    setIsLoading(true);
    try {
      await booksApi.create(token, {
        ...data,
        price: parseFloat(data.price),
      });
      toast.success("Book listed successfully! Pending approval.");
      router.push("/my-books");
    } catch (error) {
      toast.error("Failed to create book listing");
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to list a book</h2>
        <LoginModal>
          <Button>Login Now</Button>
        </LoginModal>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>List a New Book</CardTitle>
          <CardDescription>
            Fill in the details to list your book for sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-create-book" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input {...form.register("title")} placeholder="Book Title" />
                {form.formState.errors.title && <FieldError errors={[form.formState.errors.title]} />}
              </Field>

              <Field>
                <FieldLabel>Author</FieldLabel>
                <Input {...form.register("author")} placeholder="Author Name" />
                {form.formState.errors.author && <FieldError errors={[form.formState.errors.author]} />}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Price (Rs.)</FieldLabel>
                  <Input {...form.register("price")} type="number" placeholder="0.00" />
                  {form.formState.errors.price && <FieldError errors={[form.formState.errors.price]} />}
                </Field>

                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Input {...form.register("category")} placeholder="Fiction, Science, etc." />
                  {form.formState.errors.category && <FieldError errors={[form.formState.errors.category]} />}
                </Field>
              </div>

              <Field>
                <FieldLabel>Condition</FieldLabel>
                <Input {...form.register("condition")} placeholder="New, Good, Fair" />
                {form.formState.errors.condition && <FieldError errors={[form.formState.errors.condition]} />}
              </Field>

              <Field>
                <FieldLabel>Image URL</FieldLabel>
                <div className="flex gap-2">
                  <Input {...form.register("image")} placeholder="https://example.com/image.jpg" />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.image && <FieldError errors={[form.formState.errors.image]} />}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" form="form-create-book" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            List Book
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
