import React from 'react';
import { animated, useTransition } from '@react-spring/web';
import { Button, Card, CardContent, Typography } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';

interface Slide {
  title: string;
  content: string;
}

interface Props {
  onNavigateToApp: () => void;
}

const Onboarding: React.FC<Props> = ({ onNavigateToApp }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const slides = [
    {
      title: 'Welcome!',
      content: 'This app is designed to demonstrate the capabilities of spatial audio!',
    },
    {
      title: 'But what is spatial audio?',
      content: 'Hopefully by now you are wearing your headphones (if not, I suggest grabbing your nearest pair!)\n\nWhen we listen to music through headphones, sound is being projected out of two speakers (one for each ear) and directly into our ears.\n\nWhen we listen to music in this manner, we can call this stereo audio.',
    },
    {
      title: 'Stereo vs Spatial pt.1',
      content: 'Stereo is great because it allows us to record music in a way that can position (or pan) sounds left and right by increasing or decreasing the volume in each ear. However, when we hear things in “real life”, lots of other factors are in play.\nSound never comes at us from just a left or right direction, but from all around us! Left, right, up, down, forwards, backwards, and every degree in between!\nIn addition, our human physiology comes into play; our head and ears actually block and shape sounds before they are picked up by our ear drums and brain.\nThis is why music can sound different coming through headphones compared to actually being in the room with musicians.',
    },
    {
      title: 'Stereo vs Spatial pt.2',
      content: 'Sound never comes at us from only a left or right direction, but from all around us! Left, right, up, down, forwards, backwards, and every degree in between!\n\nIn addition, our human physiology matters; our head and ears actually block and shape sounds before they are picked up by our ear drums and brain.\n\nThis is why music can sound different coming through headphones compared to actually being in a room with musicians.',
    },
    {
      title: 'So what?',
      content: 'Spatial audio technology is an attempt to recreate this `real-world` listening experience by adding `locality` to sound sources, positioning them around us!\n\nCinema surround sound systems can do this by using lots of different speakers in a theatre, and playing sounds out of each one.\n\nHowever, what this app will show you is that we can also do this virtually, using only a single pair of headphones.',
    },
    {
      title: 'Cool!',
      content: 'Right? This kind of technology is especially useful in areas like virtual reality (VR) and video games, where being able to hear `where` sounds are coming from in a game or simulation is important. Spatial audio technology can help our perception of game events or notifications, while also increasing the immersion factor of those experiences.',
    },
    {
      title: 'So what is next?',
      content: 'In this app, you are going to make your own 3D sound world, using your favourite piece of music!\n\nYou will upload a music file, then the app will separate that file into instruments, which you can then position around your listening position; like making your own concert hall where you choose where all the musicians sit!\n\nHave your music file at the ready, and we can begin!',
    },
  ];
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

export default Onboarding;