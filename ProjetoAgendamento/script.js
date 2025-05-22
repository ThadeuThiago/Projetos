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
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const app = document.getElementById('app');

  // Splash screen com animação (opcional, aqui simples)
  setTimeout(() => {
    splash.classList.add('hidden');
    app.classList.remove('hidden');
  }, 3000);

  // Função para formatar data em dd/mm/yyyy
  function formatDate(d) {
    return d.toLocaleDateString('pt-BR');
  }

  // Função para obter datas da semana atual (segunda a domingo)
  function getDatesOfWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Dom) a 6 (Sáb)
    // Corrige para segunda = 1, domingo = 7
    const mondayDiff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayDiff);

    let dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  // Função para criar opções de horário
  function getHorarios() {
    // 10-12 e 16-22, intervalos de 1h
    let horarios = [];
    for (let h = 10; h <= 11; h++) horarios.push(`${h}:00`);
    for (let h = 16; h <= 21; h++) horarios.push(`${h}:00`);
    return horarios;
  }

  // Função para montar página de agendamento
  function renderAgendamento(user) {
    app.innerHTML = `
      <header style="width:100%; max-width:480px; margin-bottom: 30px; display:flex; justify-content: space-between; align-items:center;">
        <h1 class="title">Bem-vindo, ${user.displayName}</h1>
        <button id="logout">Sair</button>
      </header>
      <section id="agendamento">
        <div class="servicos-container">
          <div class="servico" data-servico="cabelo">Cabelo</div>
          <div class="servico" data-servico="barba">Barba</div>
          <div class="servico" data-servico="sobrancelha">Sobrancelha</div>
        </div>
        <div id="total">Total: R$ 0,00</div>
        <div class="select-container" id="selects-container" style="display:none;">
          <label for="data">Escolha o dia</label>
          <select id="data"></select>

          <label for="horario">Escolha o horário</label>
          <select id="horario"></select>

          <button id="confirmar">Confirmar Agendamento</button>
        </div>
        <div id="mensagem-sucesso"></div>
      </section>
    `;

    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', () => auth.signOut());

    const servicosEls = document.querySelectorAll('.servico');
    const totalEl = document.getElementById('total');
    const selectsContainer = document.getElementById('selects-container');
    const dataSelect = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    const confirmarBtn = document.getElementById('confirmar');
    const mensagemSucesso = document.getElementById('mensagem-sucesso');

    let servicosSelecionados = new Set();

    // Preencher select de datas
    const datas = getDatesOfWeek();
    datas.forEach(d => {
      const option = document.createElement('option');
      option.value = d.toISOString().substring(0,10);
      option.textContent = formatDate(d);
      dataSelect.appendChild(option);
    });

    // Preencher select de horários
    const horarios = getHorarios();
    horarios.forEach(h => {
      const option = document.createElement('option');
      option.value = h;
      option.textContent = h;
      horarioSelect.appendChild(option);
    });

    // Valores dos serviços
    const valores = {
      cabelo: 20.0,
      barba: 2.5, // adicional barba ao cabelo
      sobrancelha: 2.5 // adicional sobrancelha no total
    };

    function atualizarTotal() {
      let total = 0;
      if (servicosSelecionados.has('cabelo')) {
        total = valores.cabelo;
        if (servicosSelecionados.has('barba')) total += valores.barba;
        if (servicosSelecionados.has('sobrancelha')) total += valores.sobrancelha;
      }
      totalEl.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    servicosEls.forEach(el => {
      el.addEventListener('click', () => {
        const servico = el.dataset.servico;
        if (servicosSelecionados.has(servico)) {
          servicosSelecionados.delete(servico);
          el.classList.remove('selecionado');
        } else {
          servicosSelecionados.add(servico);
          el.classList.add('selecionado');
        }

        if (servicosSelecionados.has('cabelo')) {
          selectsContainer.style.display = 'flex';
        } else {
          selectsContainer.style.display = 'none';
          mensagemSucesso.textContent = '';
        }

        atualizarTotal();
      });
    });

    confirmarBtn.addEventListener('click', async () => {
      mensagemSucesso.textContent = '';
      if (servicosSelecionados.size === 0 || !servicosSelecionados.has('cabelo')) {
        alert('Selecione pelo menos o serviço de cabelo.');
        return;
      }

      const dataEscolhida = dataSelect.value;
      const horarioEscolhido = horarioSelect.value;

      if (!dataEscolhida || !horarioEscolhido) {
        alert('Selecione data e horário.');
        return;
      }

      const servicosArray = Array.from(servicosSelecionados);

      // Monta objeto para salvar
      const agendamento = {
        uid: user.uid,
        nome: user.displayName,
        email: user.email,
        servicos: servicosArray,
        data: dataEscolhida,
        horario: horarioEscolhido,
        criadoEm: new Date().toISOString()
      };

      try {
        // Salva no Firestore
        await db.collection('agendamentos').add(agendamento);
        mensagemSucesso.textContent = 'Agendamento realizado com sucesso!';
        // Limpa seleção
        servicosSelecionados.clear();
        servicosEls.forEach(el => el.classList.remove('selecionado'));
        atualizarTotal();
        selectsContainer.style.display = 'none';

        // Você pode aqui chamar função para atualizar relatório/email (se implementar)
      } catch (err) {
        console.error('Erro ao salvar agendamento:', err);
        alert('Erro ao salvar agendamento. Tente novamente.');
      }
    });
  }

  // Função para renderizar tela de login Google
  function renderLogin() {
    app.innerHTML = `
      <h1 class="title">Barbearia dos Campeões</h1>
      <button id="google-login">Entrar com Google</button>
    `;

    const googleLoginBtn = document.getElementById('google-login');

    googleLoginBtn.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(err => alert(err.message));
    });
  }

  // Verifica status de login e renderiza telas
  auth.onAuthStateChanged(user => {
    if (user) {
      renderAgendamento(user);
    } else {
      renderLogin();
    }
  });
});
