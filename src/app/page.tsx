'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography, List, ListItem, Divider } from '@mui/material';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showRandom, setShowRandom] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cards').select('*');
    if (!error) setCards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (!error) setCards(cards.filter(card => card.id !== id));
  };

  const checkAnswer = async () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const correct = userAnswer.trim().toLowerCase() === currentCard.answer.trim().toLowerCase();
    setFeedback(correct ? 'Correct ✅' : 'Wrong ❌');
    setUserAnswer('');

    await supabase.from('card_attempts').insert([{ card_id: currentCard.id, is_correct: correct }]);

    if (showRandom) {
      const nextIndex = Math.floor(Math.random() * cards.length);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Flashcard App
      </Typography>

      <CardForm categoryId="e9d817ba-82ca-4481-8aae-7c3dbb1fe1c2" onSaved={fetchCards} />

      {loading ? <Typography>Loading...</Typography> : null}

      <List>
        {cards.map(card => (
          <ListItem key={card.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>
              <strong>{card.question}</strong> → {card.answer}
            </Typography>
            <Button variant="contained" color="error" onClick={() => deleteCard(card.id)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 4 }} />

      {cards.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom>Play Mode</Typography>
          <FormControlLabel
            control={<Checkbox checked={showRandom} onChange={(e) => setShowRandom(e.target.checked)} />}
            label="Show Random"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Question:</Typography>
            <Typography sx={{ mb: 1 }}>{cards[currentIndex]?.question}</Typography>
            <TextField
              label="Your Answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" onClick={checkAnswer}>Check Answer</Button>
            {feedback && <Typography sx={{ mt: 1 }}>{feedback}</Typography>}
          </Box>
        </Box>
      )}
    </Box>
  );
}
