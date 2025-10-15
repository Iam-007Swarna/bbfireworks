"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [err,setErr]=useState(""); const router=useRouter();
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={async e=>{
        e.preventDefault();
        const res = await signIn("credentials",{ email,password, redirect:false });
        if (res?.error) setErr("Invalid credentials");
        else router.push("/admin");
      }}>
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn w-full">Sign in</button>
      </form>
    </div>
  );
}