import React from 'react';

function Newsletter() {
  return (
    <section id="newsletter" className="container">
      <h2>Fique ligado sobre nossas ofertas!</h2>
      <form>
        <input type="email" placeholder="E-mail" />
        <button type="submit">Se inscreva!</button>
      </form>
    </section>
  );
}

export default Newsletter;
