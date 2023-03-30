import React from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';

interface Slide {
  title: string;
  content: string;
}

interface Props {
  slides: Slide[];
  onNavigateToApp: () => void;
}

const Slideshow: React.FC<Props> = ({ slides, onNavigateToApp }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const handleNextSlide = () => {
    setCurrentSlideIndex((currentIndex) =>
      currentIndex === slides.length - 1 ? currentIndex : currentIndex + 1,
    );
  };

  const isLastSlide = currentSlideIndex === slides.length - 1;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {slides[currentSlideIndex].title}
        </Typography>
        <Typography variant="body1">{slides[currentSlideIndex].content}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={isLastSlide ? onNavigateToApp : handleNextSlide}
        >
          {isLastSlide ? 'Start App' : 'Next'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Slideshow;