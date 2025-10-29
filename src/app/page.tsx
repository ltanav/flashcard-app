'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CardForm from '@/components/CardForm';

interface Card {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cards').select('*');
    if (error) {
      console.error('Error fetching cards:', error);
    } else {
      setCards(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) {
      console.error('Error deleting card:', error);
    } else {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Flashcard App Test</h1>

      {/* Form to create new card */}
      <CardForm
        categoryId="e9d817ba-82ca-4481-8aae-7c3dbb1fe1c2" 
        onSaved={fetchCards} 
      />

      {loading ? <p>Loading...</p> : null}

      {/* Cards list */}
      <ul>
        {cards.map(card => (
          <li key={card.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{card.question}</strong> → {card.answer}{' '}
            <button onClick={() => deleteCard(card.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
