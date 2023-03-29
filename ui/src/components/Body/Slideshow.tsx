import React from 'react';
import { animated, useTransition } from '@react-spring/web';
import { Button, Card, CardContent, Typography } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';

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

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }

  const transitions = useTransition(slides[currentSlideIndex], {
    from: { opacity: 0, transform: 'translate3d(0,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,0,0)' },
  });

  const isLastSlide = currentSlideIndex === slides.length - 1;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {transitions((style, slide) => (
        <animated.div style={{ ...style, position: 'absolute', padding: 50 }} >
          <Card sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            width: '100%',
            maxWidth: '60vw',
            margin: 'auto'
          }}>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontSize: '3rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '2rem', textAlign: 'center' }}>
                {slide.title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: '2.5rem', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                {slide.content}
              </Typography>
              <ButtonGroup variant="contained" sx={{display: 'flex', justifyContent: 'center', alignItems:'center', marginTop: '2rem', boxShadow: 'none'}}>
                <Button disabled={currentSlideIndex === 0} onClick={handlePreviousSlide} sx={{ marginRight: 'auto' }}>
                  Previous
                </Button>
                <Button sx={{ marginLeft: 'auto' }} onClick={isLastSlide ? onNavigateToApp : handleNextSlide}>
                  {isLastSlide ? 'Start App' : 'Next'}
                </Button>
              </ButtonGroup>
            </CardContent>
          </Card>
        </animated.div>
      ))}
    </div>
  );
};

export default Slideshow;