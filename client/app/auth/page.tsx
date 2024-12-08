import { AuthContainer } from "@/components/auth/v0/AuthContainer";

function page() {
  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      <AuthContainer />
    </div>
  );
}

export default page;
