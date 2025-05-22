// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyClKGd2hpX_fiCtYqe-Zr39xq3OFl8Xw3w",
  authDomain: "barbearia-dos-campeoes.firebaseapp.com",
  projectId: "barbearia-dos-campeoes",
  storageBucket: "barbearia-dos-campeoes.appspot.com",
  messagingSenderId: "328887450507",
  appId: "1:328887450507:web:bd3a134fc35b7bea5d4d8e"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const loginPage = document.getElementById('login-page');

  // Espera 2.5s e inicia a animação de saída da tela de abertura
  setTimeout(() => {
    splash.setAttribute('transition-style', 'out:wipe:up');
  }, 3650);

  // Quando terminar a animação, exibe a página de login
  splash.addEventListener('animationend', () => {
    splash.classList.add('hidden');
    loginPage.classList.remove('hidden');
  });

  // Renderiza o botão de login com Google
  const renderLogin = () => {
    loginPage.innerHTML = `
      <h1>Login</h1>
      <button id="google-login">Entrar com Google</button>
    `;

    document.getElementById('google-login').addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(error => {
        alert('Erro no login: ' + error.message);
      });
    });
  };

  // Observa mudanças no estado de autenticação
  auth.onAuthStateChanged(user => {
    if (user) {
      loginPage.innerHTML = `
        <h1>Bem-vindo, ${user.displayName} 👋</h1>
        <button id="logout">Sair</button>
      `;
      document.getElementById('logout').addEventListener('click', () => {
        auth.signOut();
      });
    } else {
      renderLogin();
    }
  });
});
