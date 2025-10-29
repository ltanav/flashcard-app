'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Box, Button, TextField, Typography, List, ListItem, Divider } from '@mui/material';

interface Card {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

interface CardStats {
  correct: number;
  wrong: number;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showRandom, setShowRandom] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState<{ [key: string]: CardStats }>({});
  const [insertErrorMsg, setInsertErrorMsg] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cards').select('*');
    if (!error) setCards(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data, error } = await supabase.from('card_attempts').select('*');
    if (!error && data) {
      const newStats: { [key: string]: CardStats } = {};
      data.forEach((attempt: any) => {
        if (!newStats[attempt.card_id]) newStats[attempt.card_id] = { correct: 0, wrong: 0 };
        if (attempt.is_correct) newStats[attempt.card_id].correct += 1;
        else newStats[attempt.card_id].wrong += 1;
      });
      setStats(newStats);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchStats();
  }, []);

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (!error) {
      setCards(cards.filter(card => card.id !== id));
      const newStats = { ...stats };
      delete newStats[id];
      setStats(newStats);
    }
  };

  const checkAnswer = async () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const correct = userAnswer.trim().toLowerCase() === currentCard.answer.trim().toLowerCase();
    setFeedback(correct ? 'Correct ✅' : 'Wrong ❌');
    setUserAnswer('');
    setInsertErrorMsg(null);

    const { data: insertData, error: insertError } = await supabase
      .from('card_attempts')
      .insert([{ card_id: currentCard.id, is_correct: correct }]);

    if (insertError) {
      console.error('Insert attempt error:', insertError);
      setInsertErrorMsg(`Insert failed: ${insertError.message || JSON.stringify(insertError)}`);
    } else {
      fetchStats();
    }

    if (showRandom) {
      const nextIndex = Math.floor(Math.random() * cards.length);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>Flashcard App</Typography>

      {loading && <Typography>Loading...</Typography>}

      {insertErrorMsg && <Typography color="error">{insertErrorMsg}</Typography>}

      <List>
        {cards.map(card => (
          <ListItem key={card.id} sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>
                <strong>{card.question}</strong> → {card.answer}
              </Typography>
              <Button variant="contained" color="error" onClick={() => deleteCard(card.id)}>Delete</Button>
            </Box>
            {stats[card.id] && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                ✅ {stats[card.id].correct} / ❌ {stats[card.id].wrong}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 4 }} />

      {cards.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom>Play Mode</Typography>
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
