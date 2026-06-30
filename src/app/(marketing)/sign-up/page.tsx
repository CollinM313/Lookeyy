import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted-foreground">Book and manage video tours of homes.</p>
      <div className="mt-8 w-full">
        <SignUpForm />
      </div>
    </div>
  );
}
