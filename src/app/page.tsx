"use client"

import Form from "@/components/Form";
import { useState } from "react";

export default function Home() {

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="hero mt-10 flex flex-col gap-6">
      <div className="hero-content flex-col lg:flex-row">
        <div>
          <h1 className="text-5xl font-bold">Cookie Jar 🍪</h1>
          <p className="py-6">Create a pool of capital or &ldquo;cookie jar&rdquo; for a pre-defined list of teams/individuals and allowing them to draw from the pool after self-reporting</p>
          <button className="btn btn-primary" onClick={() => setOpen(!open)}>Create a Cookie Jar</button>
        </div>
      </div>
      <div>{open ? <Form /> : null}</div>
    </div>
  )
}
