'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface CardFormProps {
  cardId?: string; 
  initialQuestion?: string;
  initialAnswer?: string;
  categoryId: string;
  onSaved: () => void; 
}

export default function CardForm({ cardId, initialQuestion = '', initialAnswer = '', categoryId, onSaved }: CardFormProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (cardId) {
      const { error } = await supabase
        .from('cards')
        .update({ question, answer })
        .eq('id', cardId);
      if (error) console.error(error);
    } else {
      
      const { error } = await supabase
        .from('cards')
        .insert([{ question, answer, category_id: categoryId }]);
      if (error) console.error(error);
    }
    setLoading(false);
    setQuestion('');
    setAnswer('');
    onSaved(); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {cardId ? 'Update' : 'Add'} Card
      </button>
    </form>
  );
}
