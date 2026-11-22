import { useAuth } from "./AuthContext";

function LoginScreen() {
  const { login, loading } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Bienvenue sur Yfokon</h1>
      <p>Connectez-vous avec votre compte Authentik pour continuer.</p>
      <button 
        onClick={login} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Connexion en cours...' : 'Se connecter avec Authentik'}
      </button>
    </div>
  );
}