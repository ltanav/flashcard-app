'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Card {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

export default function CardList() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
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
    await supabase.from('cards').delete().eq('id', id);
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <div>
      <h2>Cards</h2>
      {loading ? <p>Loading...</p> : null}
      <ul>
        {cards.map(card => (
          <li key={card.id}>
            <strong>{card.question}</strong> → {card.answer}
            <button onClick={() => deleteCard(card.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
