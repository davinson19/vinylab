import { useLanguage } from '../../utils/LanguageContext';

const FormularioPerfil = ({
  profileData,
  savingProfile,
  profileSuccess,
  profileError,
  onChange,
  onSubmit
}) => {
  const { t } = useLanguage();

  return (
    <section className="profile-view-container fade-in" aria-label={t('profileTitulo')}>
      <article className="profile-card">
        <header className="profile-card-header">
          <h2 className="profile-card-title">{t('profileTitulo')}</h2>
          <p className="profile-card-subtitle">{t('profileSub')}</p>
        </header>

        {profileError && <div className="error-message fade-in spaced-error">{profileError}</div>}
        {profileSuccess && <div className="success-message fade-in spaced-success">{t('profileExito')}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-nombre">{t('profileNombre')}</label>
            <input
              type="text"
              id="profile-nombre"
              name="nombre"
              className="form-input"
              placeholder={t('nombrePlaceholder')}
              value={profileData.nombre}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">{t('profileEmail')}</label>
            <input
              type="email"
              id="profile-email"
              name="email"
              className="form-input"
              placeholder={t('emailPlaceholder')}
              value={profileData.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-direccion">{t('profileDireccion')}</label>
            <input
              type="text"
              id="profile-direccion"
              name="direccion"
              className="form-input"
              placeholder={t('profileDireccionPlaceholder')}
              value={profileData.direccion}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-contrasena">{t('profileContrasena')}</label>
            <input
              type="password"
              id="profile-contrasena"
              name="contrasena"
              className="form-input"
              placeholder={t('profileContrasenaPlaceholder')}
              value={profileData.contrasena}
              onChange={onChange}
            />
          </div>

          <div className="profile-form-footer">
            <button 
              type="submit" 
              className="btn-primary btn-flex-no-margin" 
              disabled={savingProfile}
            >
              {savingProfile ? t('profileGuardando') : t('profileGuardar')}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
};

export default FormularioPerfil;
