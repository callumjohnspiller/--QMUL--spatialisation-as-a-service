import React from 'react';
import { animated, PickAnimated, SpringValues, useSpring } from '@react-spring/web';
import styled from 'styled-components';

interface WelcomeScreenProps {
  onClick: () => void;
}

const Title = styled.h1`
  font-size: 64px;
  font-weight: bold;
  text-align: center;
  margin-top: 20vh;
`;

const AnimatedTitle = animated(Title);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClick }) => {
  const styles: SpringValues<PickAnimated<{ delay: number; from: { opacity: number }; to: { opacity: number } }>> = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 1000
  });

  return (
    <AnimatedTitle style={styles} onClick={onClick}>
      Spatialisation As A Service
    </AnimatedTitle>
  );
};



export default WelcomeScreen;