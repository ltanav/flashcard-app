'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);
  const [randomOrder, setRandomOrder] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: cardsData } = await supabase.from('cards').select('*');
      const { data: categoriesData } = await supabase.from('categories').select('*');
      if (cardsData) setCards(cardsData);
      if (categoriesData) setCategories(categoriesData);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const filteredCards = selectedCategory
    ? cards.filter(c => c.category_id === selectedCategory)
    : cards;

  const currentCard = filteredCards[currentIndex] || null;

  const checkAnswer = async () => {
    if (!currentCard) return;

    const correct = userAnswer.trim().toLowerCase() === currentCard.answer.toLowerCase();
    if (correct) {
      setMessage('Õige vastus! 🎉');
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setMessage(`Vale vastus 😢 Õige vastus oli: ${currentCard.answer}`);
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    await supabase.from('card_attempts').insert([
      { card_id: currentCard.id, is_correct: correct },
    ]);
  };

  const nextCard = () => {
    setMessage('');
    setUserAnswer('');
    if (filteredCards.length === 0) return;

    if (randomOrder) {
      const randomIndex = Math.floor(Math.random() * filteredCards.length);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion || !newAnswer || !newCategory) return;

    const { data, error } = await supabase
      .from('cards')
      .insert([{ question: newQuestion, answer: newAnswer, category_id: newCategory }])
      .select();

    if (!error && data) {
      setCards(prev => [...prev, ...data]);
      setNewQuestion('');
      setNewAnswer('');
      setNewCategory('');
      setOpenAddDialog(false);
    }
  };

  if (loading) return <Typography>Laen andmeid...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 6 }}>
      <Typography variant="h3" gutterBottom>
        Flashcard App
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Kategooria</InputLabel>
          <Select
            value={selectedCategory}
            label="Kategooria"
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
            }}
          >
            <MenuItem value="">Kõik</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={randomOrder}
              onChange={() => setRandomOrder(prev => !prev)}
            />
          }
          label="Juhuslik järjekord"
        />
      </Box>

      {currentCard ? (
        <Card sx={{ p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Küsimus:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentCard.question}
            </Typography>

            <TextField
              label="Sinu vastus"
              variant="outlined"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={checkAnswer}
              sx={{ mr: 2 }}
            >
              Kontrolli vastust
            </Button>

            <Button variant="outlined" onClick={nextCard}>
              Järgmine küsimus
            </Button>

            {message && (
              <Typography
                variant="body1"
                sx={{ mt: 2, color: message.includes('Õige') ? 'green' : 'red' }}
              >
                {message}
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <Typography>Küsimusi valitud kategoorias pole.</Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Statistika</Typography>
        <Typography>Õigeid vastuseid: {stats.correct}</Typography>
        <Typography>Valesid vastuseid: {stats.wrong}</Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenAddDialog(true)}
        >
          Lisa uus küsimus
        </Button>
      </Box>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Lisa uus küsimus</DialogTitle>
        <DialogContent>
          <TextField
            label="Küsimus"
            fullWidth
            sx={{ mb: 2 }}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <TextField
            label="Vastus"
            fullWidth
            sx={{ mb: 2 }}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Kategooria</InputLabel>
            <Select
              value={newCategory}
              label="Kategooria"
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Tühista</Button>
          <Button variant="contained" onClick={handleAddQuestion}>
            Salvesta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
