import React, { useState } from 'react';
import { animated, PickAnimated, SpringValues, useSpring } from '@react-spring/web';
import styled from 'styled-components';
import { Button } from '@mui/material';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import Onboarding from './Onboarding';

interface WelcomeScreenProps {
  onClick: () => void;
}

const Title = styled.div`
  font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
  font-size: 64px;
  font-weight: bold;
  text-align: center;
  margin-top: 20vh;
`;

const Subtitle = styled.h2`
  font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
  font-size: 16px;
  text-align: center;
  margin-top: 20vh;
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 1vh;
`;

const AnimatedTitle = animated(Title);
const AnimatedSubtitle = animated(Subtitle);
const AnimatedButtonContainer = animated(ButtonContainer);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClick }) => {
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const styles: SpringValues<PickAnimated<{
    delay: number;
    from: { opacity: number };
    to: { opacity: number }
  }>> = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 1000
  });

  const styles2: SpringValues<PickAnimated<{
    delay: number;
    from: { opacity: number };
    to: { opacity: number }
  }>> = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 1500
  });

  const styles3: SpringValues<PickAnimated<{
    delay: number;
    from: { opacity: number };
    to: { opacity: number }
  }>> = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 2000
  });

  function handleOnboarding() {
    setOnboarded(true);
  }

  return (
    <div style={{position: "relative"}}>
      {!onboarded &&
        <div>
          <AnimatedTitle style={styles}>
            Spatialisation As A Service
          </AnimatedTitle>
          <AnimatedSubtitle style={styles2}>
            (Don't forget your headphones!)
            <HeadphonesIcon sx={{padding: 5, display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: 1, width: 80, height: 80}}/>
          </AnimatedSubtitle>
          <AnimatedButtonContainer style={styles3}>
            <Button onClick={handleOnboarding}
                    variant="contained"
                    sx={{ padding: 2, display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: 10 }}>Enter</Button>
            <Button onClick={onClick}
                    variant="outlined"
                    sx={{ padding: 2, display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: 10 }}>Skip Introduction</Button>
          </AnimatedButtonContainer>
        </div>
      }
      {
        onboarded &&
        <div>
          <Onboarding onNavigateToApp={onClick}/>
        </div>
      }
    </div>
  );
};


export default WelcomeScreen;