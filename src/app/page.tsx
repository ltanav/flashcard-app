'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Card {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from('cards').select('*');
      if (error) {
        console.error('Error fetching cards:', error);
      } else {
        setCards(data);
      }
    };

    fetchCards();
  }, []);

  return (
    <div>
      <h1>Flashcard App Test</h1>
      <pre>{JSON.stringify(cards, null, 2)}</pre>
    </div>
  );
}
