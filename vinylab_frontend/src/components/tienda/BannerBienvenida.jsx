import welcomeGif from '../../assets/banner.gif';
import { useLanguage } from '../../utils/LanguageContext';

const BannerBienvenida = ({ user }) => {
  const { idioma } = useLanguage();

  return (
    <section 
      className="store-welcome-banner-full" 
      style={{ '--welcome-banner-url': `url(${welcomeGif})` }}
    >
      <h1 className="welcome-title">
        {idioma === 'es' 
          ? `¡Hola${user ? `, ${user.nombre}` : ''}! Bienvenido a VinyLab`
          : `Hello${user ? `, ${user.nombre}` : ''}! Welcome to VinyLab`
        }
      </h1>
    </section>
  );
};

export default BannerBienvenida;
