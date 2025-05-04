import React, { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  user_id: string;
  urgency: string;
  category: string[];
  status: string;
  phone_model: string;
}

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No access token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='bg-gray-800 min-h-screen text-white pt-6 pl-12'>
      <h1 className='font-medium text-5xl mb-4'>Dashboard</h1>
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.id} className='font-medium space-y-4 mb-4 bg-gray-700 w-[35%] p-4 rounded-sm cursor-pointer'>
            <h3 className='text-2xl text-green-500'>Ticket #{ticket.id}</h3>
            <p>Status: {ticket.status}</p>
            <p>Urgency: {ticket.urgency}</p>
            <p>Phone Model: {ticket.phone_model}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;