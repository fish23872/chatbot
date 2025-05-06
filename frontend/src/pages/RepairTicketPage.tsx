import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTickets } from "../contexts/TicketsContext";
import { RepairTicket } from "@types";

export const RepairTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicket } = useTickets();
  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [technicianNotes, setTechnicianNotes] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const categoryTips: Record<string, string> = {
    screen: "Tip: Avoid putting pressure on the screen - cracks can worsen even without direct impact.",
    battery: "Tip: Don't let your battery drop below 20% regularly-it shortens lifespan over time.",
    water: "Myth: Rice doesn't fix water damage. It often makes it worse by leaving residues--seek professional drying immediately.",
    charging: "Tip: Using third-party chargers can damage the charging port over time—stick to certified cables.",
    other: "Tip: Provide detailed notes for 'other' issues--technicians can't fix what they can't identify.",
    unclear: "Tip: Try to recall what happened before the issue-it can help with diagnostics even if you're unsure."
  };

  function getRoleFromToken(): string | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }
  const role = getRoleFromToken();

  useEffect(() => {
    if (!id) return;
    getTicket(id)
      .then(t => {
        if (!t) setError("Ticket not found");
        else setTicket(t);
      })
      .catch(() => setError("Failed to load ticket"));
  }, [id]);

  const handleTechnicianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianNotes) {
      alert("Please provide notes")
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("User is not authenticated.");
        return;
      }
      const payload = {
        technicianNotes
      }
      const response = await fetch(`http://${window.location.hostname}:8000/tickets/${ticket?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update ticket");
      }
  
      setSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit info.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
  
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("User is not authenticated.");
        return;
      }
  
      const payload = {
        email,
        customerNotes,
      };
  
      const response = await fetch(`http://${window.location.hostname}:8000/tickets/${ticket?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update ticket");
      }
  
      setSubmitted(true);
  
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit contact info.");
    }
  };
  if (error) return <div>{error}</div>;
  if (!ticket) return <div>Loading ticket...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 min-w-screen min-h-screen text-white">
      <div className="flex flex-row text-2xl font-bold mb-6">      
        <h1 className="mr-2">Repair Ticket</h1>
        <h1 className="text-green-500">#{ticket.id}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Issue Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Urgency</h3>
              <p className={ticket.urgency === "urgent" ? "text-red-400" : "text-yellow-400"}>
                {ticket.urgency}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Phone Model</h3>
              <p>{ticket.phone_model}</p>
            </div>
            <div>
              <h3 className="font-medium">Issue Category</h3>
              <p>{ticket.category.join(", ")}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <p className={ticket.status === "open" ? "text-yellow-400" : "text-green-500"}>{ticket.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Created</h3>
              <p>{ticket.createdAt.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {role === "user" && (
        <div className="bg-blue-700 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-xl">Issue Category</h3>
          <p>{ticket.category.join(", ")}</p>
          {ticket!.category.map((cat) => (
            <div key={cat} className="mt-4">
              <p className="text-lg text-gray-300">{categoryTips[cat]}</p>
            </div>
          ))}
        </div>)}
      </div>

      {role === "operator" && (
      <div className="mt-10 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Technician Notes</h2>
        <textarea
          value={technicianNotes}
          onChange={e => setTechnicianNotes(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          rows={5}
          placeholder="Technician observations..."
        />
        <button
          onClick={handleTechnicianSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
        >
          Save Notes
        </button>
        {submitted && <p className="text-green-400 mt-2">Technician notes saved.</p>}
      </div>
    )}
    {role === "user" && (
      <div className="mt-10 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Follow-up Contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              value={customerNotes}
              onChange={e => setCustomerNotes(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Any further details..."
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            Submit
          </button>
          {submitted && <p className="text-green-400 mt-2">Information submitted successfully.</p>}
        </form>
      </div>
      )}
    </div>
  );
};

export default RepairTicketPage;