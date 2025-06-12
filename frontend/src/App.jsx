import './style.css'; // Import global styles
import Header from './components/Header';
import Hero from './components/Hero';
import Brands from './components/Brands';
import ViewMoreButton from './components/ViewMoreButton';
import TopSelling from './components/TopSelling';
import StyleSearch from './components/StyleSearch';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Brands />
        <ViewMoreButton />
        <TopSelling />
        <StyleSearch />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

export default App;
