'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Box, Button, TextField, Typography } from '@mui/material';

interface CardFormProps {
  categoryId: string;
  onSaved: () => void;
}

export default function CardForm({ categoryId, onSaved }: CardFormProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;

    setLoading(true);
    const { error } = await supabase.from('cards').insert([
      { question, answer, category_id: categoryId }
    ]);

    setLoading(false);
    if (!error) {
      setQuestion('');
      setAnswer('');
      onSaved();
    } else {
      console.error(error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>Add New Card</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          sx={{ mr: 2, mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Box>
  );
}
