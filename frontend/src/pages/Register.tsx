import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Anchor } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import api from "../api/axios"

export const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "crew",
    ship_id: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const { data: ships = [] } = useQuery({
    queryKey: ["ships"],
    queryFn: async () => {
      const res = await api.get("/ships")
      return res.data
    },
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await api.post("/auth/register", form)
      setSuccess("Account created! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err: any) {
      const msg = err?.response?.data?.error
      setError(
        msg || "Registration failed. Check your connection or try again.",
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-marine-dark">
      <div className="glass-panel w-full max-w-md p-10">
        <div className="text-center mb-8">
          <Anchor className="text-marine-cyan mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-semibold text-white">Create Account</h1>
          <p className="text-marine-muted text-sm mt-1">
            Join the Fathom platform
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-3 rounded-lg mb-4 text-center text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input-field"
          >
            <option value="crew">Crew</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={form.ship_id}
            onChange={(e) => setForm({ ...form, ship_id: e.target.value })}
            className="input-field"
          >
            <option value="">Assign to ship (optional)</option>
            {ships.map((ship: any) => (
              <option key={ship.id} value={ship.id}>
                {ship.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary mt-2">
            Create Account
          </button>
        </form>

        <p className="text-center text-marine-muted text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-marine-cyan hover:text-marine-cyan-hover"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
