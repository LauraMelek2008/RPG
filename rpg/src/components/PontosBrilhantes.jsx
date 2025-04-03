import React from 'react';
import './PontosBrilhantes.css';

function PontosBrilhantes() {
  const pontos = Array.from({ length: 50 }, (_, index) => (
    <div className="ponto" key={index} style={{
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
    }}/>
  ));

  return <div className="container">{pontos}</div>;
}

export default PontosBrilhantes;