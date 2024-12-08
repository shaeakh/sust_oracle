"use client";
import ProfileCard from "@/components/ProfileCard";
function Page() {

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center  p-4"
        style={{
          backgroundImage:
            "url('https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/moch-1/profile.jpg')",
        }}
      >
        <ProfileCard />
      </div>
    </>
  );
}
export default Page;
