import React from 'react';
import Hero from '../components/Hero';
import Brands from '../components/Brands';
import ViewMoreButton from '../components/ViewMoreButton';
import TopSelling from '../components/TopSelling';
import StyleSearch from '../components/StyleSearch';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

function Home() {
  return (
    <>
      <main>
        <Hero />
        <Brands />
        <ViewMoreButton />
        <TopSelling />
        <StyleSearch />
        <Testimonials />
        <Newsletter />
      </main>
    </>
  );
}

export default Home;
