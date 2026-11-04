import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmr8g7GxUDwA6XexfkPSpCB4aCY3SxZbc",
    authDomain: "gorilla-team.firebaseapp.com",
    projectId: "gorilla-team",
    storageBucket: "gorilla-team.firebasestorage.app",
    messagingSenderId: "396270879490",
    appId: "1:396270879490:web:80737d10ccf8d09add381b",
    measurementId: "G-G5M349GDFV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.db = db;
window.auth = auth;

window.cacheAlunos = [];
window.cacheTreinos = [];

window.LOGO_GYM = `<div class="w-10 h-10 rounded-none bg-gorilla-olive flex items-center justify-center font-black text-white shadow-md overflow-hidden neon-box-olive">
    <svg viewBox="0 0 100 100" class="w-full h-full object-cover">
        <circle cx="50" cy="50" r="45" fill="#121212" stroke="#657338" stroke-width="4"/>
        <path d="M25 65 L75 65 L70 35 L30 35 Z" fill="#657338"/>
        <text x="50" y="58" font-size="28" font-weight="900" fill="#fff" text-anchor="middle">GT</text>
    </svg>
</div>`;

window.LOGO_BASKET = `<div class="w-10 h-10 rounded-none bg-gorilla-orange flex items-center justify-center font-black text-white shadow-md overflow-hidden neon-box-orange">
    <svg viewBox="0 0 100 100" class="w-full h-full object-cover">
        <circle cx="50" cy="50" r="48" fill="#f97316"/>
        <path d="M10 50 Q50 20 90 50 Q50 80 10 50 Z" stroke="#000" stroke-width="3" fill="none"/>
        <line x1="50" y1="2" x2="50" y2="98" stroke="#000" stroke-width="3"/>
        <circle cx="50" cy="50" r="15" fill="#000"/>
        <text x="50" y="57" font-size="18" font-weight="900" fill="#f97316" text-anchor="middle">🏀</text>
    </svg>
</div>`;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('view-login').classList.add('hidden');
        if(user.email.includes('admin') || user.email === 'admin@gorillateam.pro') {
            localStorage.setItem('gorilla_role', 'admin');
            document.getElementById('view-home').classList.remove('hidden');
            document.getElementById('home-subtitle').innerText = "Professional Training Hub // Admin";
            document.getElementById('btn-cadastrar-aluno')?.classList.remove('hidden');
            document.getElementById('btn-nova-ficha')?.classList.remove('hidden');
            document.getElementById('btn-nova-avaliacao')?.classList.remove('hidden');
        } else {
            localStorage.setItem('gorilla_role', 'aluno');
            localStorage.setItem('gorilla_user_email', user.email);
            
            const snap = await getDocs(collection(db, "alunos"));
            let meuId = '';
            snap.forEach(d => {
                if(d.data().email === user.email) meuId = d.id;
            });
            localStorage.setItem('gorilla_aluno_id', meuId);
            
            document.getElementById('home-subtitle').innerText = "Athlete Portal // Select Discipline";
            document.getElementById('view-home').classList.remove('hidden');
        }
    } else {
        document.getElementById('view-app').classList.add('hidden');
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-login').classList.remove('hidden');
    }
});

window.alternarTelaAuth = function(tipo) {
    const fLogin = document.getElementById('form-login');
    const fReg = document.getElementById('form-registro');
    const sub = document.getElementById('auth-subtitle');
    const erroEl = document.getElementById('login-erro');
    erroEl.classList.add('hidden');

    if(tipo === 'registrar') {
        fLogin.classList.add('hidden');
        fReg.classList.remove('hidden');
        sub.innerText = "Athlete Registration // Join the Elite";
    } else {
        fReg.classList.add('hidden');
        fLogin.classList.remove('hidden');
        sub.innerText = "Restricted Access // High Performance";
    }
}

window.fazerLoginFirebase = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const erroEl = document.getElementById('login-erro');
    try {
        await signInWithEmailAndPassword(auth, email, senha);
        erroEl.classList.add('hidden');
    } catch (error) {
        erroEl.innerText = "Erro ao autenticar: Verifique e-mail e senha.";
        erroEl.classList.remove('hidden');
    }
}

window.fazerRegistroFirebase = async function(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    const erroEl = document.getElementById('login-erro');
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        await addDoc(collection(db, "alunos"), { nome, email, idade: 20, sexo: 'M', uid: cred.user.uid, createdAt: Date.now() });
        erroEl.classList.add('hidden');
        alert("Conta criada com sucesso! Faça login com suas credenciais.");
        alternarTelaAuth('login');
    } catch (error) {
        erroEl.innerText = "Erro no registro: " + error.message;
        erroEl.classList.remove('hidden');
    }
}

window.logout = function() {
    signOut(auth);
}

window.entrarSistema = function(tipo) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-app').classList.remove('hidden');
    document.getElementById('btn-voltar-modulo').style.display = 'block';
    let role = localStorage.getItem('gorilla_role');

    if(tipo === 'gym') {
        document.getElementById('system-gym').classList.remove('hidden');
        document.getElementById('system-basket').classList.add('hidden');
        document.getElementById('menu-gym').classList.remove('hidden');
        document.getElementById('menu-basket').classList.add('hidden');
        document.getElementById('sidebar-logo-container').innerHTML = window.LOGO_GYM;
        document.getElementById('sidebar-subtitle').innerText = role === 'admin' ? "Consultoria" : "Portal do Atleta";
        document.getElementById('sidebar-subtitle').className = "text-[9px] uppercase tracking-widest text-gorilla-olive font-bold neon-text-olive";
        
        if(role === 'aluno') {
            document.getElementById('nav-g-dash').style.display = 'none';
            document.getElementById('nav-g-work').innerText = "Meus Treinos";
            document.getElementById('nav-g-evol').classList.remove('hidden');
            document.getElementById('titulo-secao-treino-sub').innerText = "Área do Atleta";
            document.getElementById('titulo-secao-treino').innerText = "Meus Treinos";
            document.getElementById('btn-nova-ficha').classList.add('hidden');
            document.getElementById('btn-nova-avaliacao').classList.add('hidden');
            document.getElementById('input-busca-treinos').style.display = 'none';
            switchTabGym('workouts');
        } else {
            document.getElementById('nav-g-dash').style.display = 'flex';
            document.getElementById('nav-g-work').innerText = "Gestão de Treinos";
            document.getElementById('nav-g-evol').classList.add('hidden');
            document.getElementById('titulo-secao-treino-sub').innerText = "Prescrição";
            document.getElementById('titulo-secao-treino').innerText = "Gestão de Treinos";
            document.getElementById('btn-nova-ficha').classList.remove('hidden');
            document.getElementById('btn-nova-avaliacao').classList.remove('hidden');
            document.getElementById('input-busca-treinos').style.display = 'block';
            switchTabGym('dashboard');
        }
    } else {
        document.getElementById('system-gym').classList.add('hidden');
        document.getElementById('system-basket').classList.remove('hidden');
        document.getElementById('menu-gym').classList.add('hidden');
        document.getElementById('menu-basket').classList.remove('hidden');
        document.getElementById('sidebar-logo-container').innerHTML = window.LOGO_BASKET;
        document.getElementById('sidebar-subtitle').innerText = role === 'admin' ? "Basketball Program" : "Atleta - Quadra";
        document.getElementById('sidebar-subtitle').className = "text-[9px] uppercase tracking-widest text-gorilla-orange font-bold neon-text-orange";
        carregarJogadas();
    }
}

window.voltarHome = function() {
    document.getElementById('view-app').classList.add('hidden');
    document.getElementById('view-home').classList.remove('hidden');
}

window.openModal = function(id) { 
    document.getElementById(id).classList.remove('hidden'); 
    document.getElementById(id).classList.add('flex'); 
    if(id==='modal-treino' && !document.getElementById('treino-edit-id').value) {
        carregarSelectAlunosGym();
    }
    if(id==='modal-avaliacao') carregarSelectAlunosGymAval();
}
window.closeModal = function(id) { 
    document.getElementById(id).classList.remove('flex'); 
    document.getElementById(id).classList.add('hidden'); 
}

window.switchTabGym = function(tab) {
    ['dashboard', 'workouts', 'evaluations', 'evolution'].forEach(t => document.getElementById(`g-tab-${t}`).classList.add('hidden'));
    ['dash', 'work', 'eval', 'evol'].forEach(code => {
        let el = document.getElementById(`nav-g-${code}`);
        if(el) el.className = "w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-semibold tracking-wider uppercase transition-all text-gorilla-textMuted hover:bg-gorilla-border hover:text-white";
    });
    document.getElementById(`g-tab-${tab}`).classList.remove('hidden');
    let activeCode = tab === 'dashboard' ? 'dash' : tab === 'workouts' ? 'work' : tab === 'evaluations' ? 'eval' : 'evol';
    let activeEl = document.getElementById(`nav-g-${activeCode}`);
    if(activeEl) activeEl.className = "w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-extrabold tracking-wider uppercase transition-all bg-gorilla-olive text-white neon-box-olive";
    
    if(tab === 'workouts') ouvirTreinosTempoReal();
    if(tab === 'dashboard') ouvirAlunosTempoReal();
    if(tab === 'evaluations') ouvirAvaliacoesTempoReal();
    if(tab === 'evolution') renderizarGraficosEvolucaoPorExercicio();
}

window.switchTabBasket = function(tab) {
    ['playbook', 'board', 'skills', 'scout', 'readiness', 'calendar'].forEach(t => document.getElementById(`b-tab-${t}`).classList.add('hidden'));
    ['play', 'board', 'skills', 'scout', 'read', 'cal'].forEach(code => {
        let el = document.getElementById(`nav-b-${code}`);
        if(el) el.className = "w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-semibold tracking-wider uppercase transition-all text-gorilla-textMuted hover:bg-gorilla-border hover:text-white";
    });
    let activeCode = tab === 'playbook' ? 'play' : tab === 'board' ? 'board' : tab === 'skills' ? 'skills' : tab === 'scout' ? 'scout' : tab === 'readiness' ? 'read' : 'cal';
    document.getElementById(`b-tab-${tab}`).classList.remove('hidden');
    document.getElementById(`nav-b-${activeCode}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-extrabold tracking-wider uppercase transition-all bg-gorilla-orange text-white neon-box-orange";
    
    if(tab==='playbook') carregarJogadas();
    if(tab==='skills') carregarTreinosBasket();
    if(tab==='scout') carregarScout();
    if(tab==='readiness') carregarReadiness();
    if(tab==='calendar') carregarJogos();
}

window.salvarAluno = async function(e) {
    e.preventDefault();
    const nome = document.getElementById('aluno-nome').value;
    const email = document.getElementById('aluno-email').value;
    const idade = parseInt(document.getElementById('aluno-idade').value);
    const sexo = document.getElementById('aluno-sexo').value;
    try {
        await addDoc(collection(db, "alunos"), { nome, email, idade, sexo, createdAt: Date.now() });
        closeModal('modal-aluno');
        alert("Aluno cadastrado com sucesso!");
    } catch(err) { alert("Erro ao salvar aluno."); }
}

window.deletarAluno = async function(id) {
    if(confirm("Tens a certeza que pretendes apagar este aluno?")) {
        try {
            await deleteDoc(doc(db, "alunos", id));
        } catch(e) { alert("Erro ao apagar aluno."); }
    }
}

window.ouvirAlunosTempoReal = function() {
    onSnapshot(collection(db, "alunos"), (snapshot) => {
        window.cacheAlunos = [];
        snapshot.forEach((docSnap) => {
            window.cacheAlunos.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderizarAlunosNaTela(window.cacheAlunos);
    });
}

window.renderizarAlunosNaTela = function(lista) {
    const grid = document.getElementById('lista-alunos-grid');
    grid.innerHTML = '';
    if(!lista.length) {
        grid.innerHTML = '<p class="text-xs text-gorilla-textMuted uppercase font-bold">Nenhum aluno encontrado.</p>';
        return;
    }
    lista.forEach((a) => {
        grid.innerHTML += `<div class="bg-gorilla-card border border-gorilla-border rounded-none p-5 space-y-3 shadow-sm neon-box-olive flex justify-between items-start">
            <div>
                <h3 class="font-extrabold uppercase text-white tracking-tight">${a.nome}</h3>
                <p class="text-xs text-gorilla-textMuted">${a.email || 'Sem e-mail'}</p>
                <p class="text-[10px] text-gorilla-olive font-bold mt-1">${a.idade || 20} anos • ${a.sexo === 'F' ? 'Feminino' : 'Masculino'}</p>
            </div>
            <div><button onclick="deletarAluno('${a.id}')" class="text-[10px] text-red-400 hover:underline uppercase font-bold">Apagar Aluno</button></div>
        </div>`;
    });
}

window.filtrarAlunosAdmin = function() {
    let termo = document.getElementById('input-busca-alunos').value.toLowerCase();
    let filtrados = window.cacheAlunos.filter(a => 
        a.nome.toLowerCase().includes(termo) || (a.email && a.email.toLowerCase().includes(termo))
    );
    renderizarAlunosNaTela(filtrados);
}

window.carregarSelectAlunosGym = async function() {
    const sel = document.getElementById('treino-aluno-id');
    sel.innerHTML = '<option>Carregando...</option>';
    const querySnapshot = await getDocs(collection(db, "alunos"));
    sel.innerHTML = '';
    querySnapshot.forEach((docSnap) => {
        const a = docSnap.data();
        sel.innerHTML += `<option value="${docSnap.id}">${a.nome}</option>`;
    });
}

window.carregarSelectAlunosGymAval = async function() {
    const sel = document.getElementById('aval-aluno-id');
    sel.innerHTML = '<option>Carregando...</option>';
    const querySnapshot = await getDocs(collection(db, "alunos"));
    sel.innerHTML = '';
    querySnapshot.forEach((docSnap) => {
        const a = docSnap.data();
        sel.innerHTML += `<option value="${docSnap.id}">${a.nome}</option>`;
    });
}

window.adicionarLinhaExercicio = function(nome = '', reps = '', video = '') {
    document.getElementById('container-exercicios').innerHTML += `
        <div class="bg-gorilla-dark p-3 rounded-none border border-gorilla-border space-y-2">
            <div class="flex gap-2">
                <input type="text" placeholder="Exercício" value="${nome}" class="flex-1 bg-gorilla-card border border-gorilla-border rounded-none px-3 py-1.5 text-xs text-white ex-nome outline-none" required>
                <input type="text" placeholder="Séries x Reps" value="${reps}" class="w-24 bg-gorilla-card border border-gorilla-border rounded-none px-3 py-1.5 text-xs text-white ex-reps outline-none" required>
            </div>
            <input type="text" placeholder="Link do Vídeo de Execução" value="${video}" class="w-full bg-gorilla-card border border-gorilla-border rounded-none px-3 py-1.5 text-xs text-white ex-video outline-none">
        </div>`;
}

window.abrirModalCriarTreino = function() {
    document.getElementById('treino-edit-id').value = '';
    document.getElementById('modal-treino-titulo-txt').innerText = "Nova Ficha de Treino";
    document.getElementById('treino-titulo').value = '';
    document.getElementById('container-exercicios').innerHTML = '';
    adicionarLinhaExercicio();
    openModal('modal-treino');
}

window.abrirModalEditarTreino = async function(id, alunoId, titulo, exerciciosStr) {
    document.getElementById('treino-edit-id').value = id;
    document.getElementById('modal-treino-titulo-txt').innerText = "Editar Ficha de Treino";
    document.getElementById('treino-titulo').value = titulo;
    await carregarSelectAlunosGym();
    document.getElementById('treino-aluno-id').value = alunoId;
    
    let exercicios = JSON.parse(decodeURIComponent(exerciciosStr));
    let cont = document.getElementById('container-exercicios');
    cont.innerHTML = '';
    exercicios.forEach(ex => {
        adicionarLinhaExercicio(ex.nome, ex.reps, ex.video || '');
    });
    openModal('modal-treino');
}

window.salvarTreinoAdmin = async function(e) {
    e.preventDefault();
    const editId = document.getElementById('treino-edit-id').value;
    const alunoId = document.getElementById('treino-aluno-id').value;
    const titulo = document.getElementById('treino-titulo').value;
    const exercicios = [];
    document.querySelectorAll('#container-exercicios > div').forEach(node => {
        exercicios.push({
            nome: node.querySelector('.ex-nome').value,
            reps: node.querySelector('.ex-reps').value,
            video: node.querySelector('.ex-video').value
        });
    });

    try {
        if(editId) {
            await updateDoc(doc(db, "treinos", editId), { alunoId, titulo, exercicios });
            alert("Ficha de treino atualizada com sucesso!");
        } else {
            await addDoc(collection(db, "treinos"), { alunoId, titulo, exercicios, createdAt: Date.now() });
            alert("Ficha de treino criada e enviada para o aluno em tempo real!");
        }
        closeModal('modal-treino');
    } catch(err) { alert("Erro ao salvar treino."); }
}

window.deletarTreino = async function(id) {
    if(confirm("Pretendes apagar esta ficha de treino?")) {
        try {
            await deleteDoc(doc(db, "treinos", id));
        } catch(e) { alert("Erro ao apagar treino."); }
    }
}

window.ouvirTreinosTempoReal = function() {
    let role = localStorage.getItem('gorilla_role');
    let userEmail = localStorage.getItem('gorilla_user_email');

    onSnapshot(collection(db, "alunos"), (alunosSnap) => {
        let mapaAlunos = {};
        let meuAlunoId = '';
        alunosSnap.forEach(d => {
            mapaAlunos[d.id] = d.data().nome;
            if(d.data().email === userEmail) meuAlunoId = d.id;
        });

        onSnapshot(collection(db, "treinos"), (treinosSnap) => {
            window.cacheTreinos = [];
            treinosSnap.forEach(docSnap => {
                window.cacheTreinos.push({id: docSnap.id, ...docSnap.data()});
            });

            if(role === 'aluno') {
                window.cacheTreinos = window.cacheTreinos.filter(t => t.alunoId === meuAlunoId);
            }

            renderizarTreinosNaTela(window.cacheTreinos, mapaAlunos, role);
        });
    });
}

window.renderizarTreinosNaTela = function(treinosLista, mapaAlunos, role) {
    const grid = document.getElementById('lista-treinos-grid');
    grid.innerHTML = '';
    
    if(!treinosLista.length) {
        grid.innerHTML = '<p class="text-xs text-gorilla-textMuted uppercase font-bold">Nenhum treino encontrado.</p>';
        return;
    }

    let cargasSalvas = JSON.parse(localStorage.getItem('gorilla_cargas_aluno')) || {};

    treinosLista.forEach(t => {
        let nomeAluno = mapaAlunos[t.alunoId] || 'Atleta';
        if(role === 'admin') {
            let exJson = encodeURIComponent(JSON.stringify(t.exercicios));
            grid.innerHTML += `<div class="bg-gorilla-card border border-gorilla-border rounded-none p-5 space-y-3 neon-box-olive flex justify-between items-start">
                <div>
                    <span class="text-[9px] text-gorilla-olive uppercase font-extrabold tracking-widest">Aluno: ${nomeAluno}</span>
                    <h3 class="font-extrabold uppercase text-white tracking-tight">${t.titulo}</h3>
                    <p class="text-[10px] text-gorilla-textMuted uppercase font-bold mt-1">${t.exercicios.length} exercícios prescritos</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="abrirModalEditarTreino('${t.id}', '${t.alunoId}', '${t.titulo}', '${exJson}')" class="text-[10px] text-gorilla-olive hover:underline uppercase font-bold">Editar</button>
                    <button onclick="deletarTreino('${t.id}')" class="text-[10px] text-red-400 hover:underline uppercase font-bold">Apagar</button>
                </div>
            </div>`;
        } else {
            grid.innerHTML += `<div class="bg-gorilla-card border border-gorilla-border rounded-none p-6 space-y-4 shadow-xl neon-box-olive md:col-span-2">
                <div class="flex justify-between items-center border-b border-gorilla-border pb-3">
                    <h3 class="text-lg font-black uppercase text-white italic tracking-tight">${t.titulo}</h3>
                    <span class="text-[10px] uppercase font-bold bg-gorilla-olive/20 text-gorilla-olive px-2.5 py-1 rounded-none">Prescrito por Coach</span>
                </div>
                <div class="space-y-3">
                    ${t.exercicios.map((ex, idx) => {
                        let chaveCarga = `${t.alunoId}_${t.id}_${idx}`;
                        let cargaAtual = cargasSalvas[chaveCarga] || '';
                        return `
                            <div class="bg-gorilla-dark p-4 rounded-none border border-gorilla-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <input type="text" value="${ex.nome}" readonly class="bg-transparent font-extrabold text-sm uppercase text-white outline-none w-full md:w-72 cursor-default">
                                        ${ex.video ? `<a href="${ex.video}" target="_blank" class="text-[10px] bg-gorilla-border hover:bg-gorilla-olive text-white px-2.5 py-1 rounded-none font-bold transition-all">▶ Vídeo</a>` : ''}
                                    </div>
                                    <p class="text-xs text-gorilla-textMuted font-semibold">Meta (Coach): <span class="text-white">${ex.reps}</span></p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="text-right">
                                        <label class="block text-[9px] uppercase tracking-wider text-gorilla-olive font-extrabold">Sua Carga Real</label>
                                        <input type="text" value="${cargaAtual}" placeholder="Ex: 40kg" oninput="salvarCargaAtleta('${t.alunoId}', '${t.id}', ${idx}, this.value, '${ex.nome}')" class="bg-gorilla-card border border-gorilla-border rounded-none px-3 py-1.5 text-xs font-bold text-white w-28 text-center focus:border-gorilla-olive outline-none">
                                    </div>
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
        }
    });
}

window.filtrarTreinosAdmin = async function() {
    let termo = document.getElementById('input-busca-treinos').value.toLowerCase();
    let role = localStorage.getItem('gorilla_role');
    
    const alunosSnap = await getDocs(collection(db, "alunos"));
    let mapaAlunos = {};
    alunosSnap.forEach(d => mapaAlunos[d.id] = d.data().nome);

    let filtrados = window.cacheTreinos.filter(t => {
        let nomeAluno = (mapaAlunos[t.alunoId] || '').toLowerCase();
        let tituloTreino = t.titulo.toLowerCase();
        return tituloTreino.includes(termo) || nomeAluno.includes(termo);
    });

    renderizarTreinosNaTela(filtrados, mapaAlunos, role);
}

window.salvarCargaAtleta = function(alunoId, treinoId, idx, valor, nomeExercicio) {
    let cargasSalvas = JSON.parse(localStorage.getItem('gorilla_cargas_aluno')) || {};
    let chave = `${alunoId}_${treinoId}_${idx}`;
    cargasSalvas[chave] = valor;
    localStorage.setItem('gorilla_cargas_aluno', JSON.stringify(cargasSalvas));

    let historico = JSON.parse(localStorage.getItem('gorilla_historico_cargas')) || {};
    if(!historico[alunoId]) historico[alunoId] = {};
    if(!historico[alunoId][nomeExercicio]) historico[alunoId][nomeExercicio] = [];
    
    let hoje = new Date().toLocaleDateString();
    let ultimoReg = historico[alunoId][nomeExercicio][historico[alunoId][nomeExercicio].length - 1];
    if(ultimoReg && ultimoReg.data === hoje) {
        ultimoReg.carga = parseFloat(valor) || 0;
    } else {
        historico[alunoId][nomeExercicio].push({ data: hoje, carga: parseFloat(valor) || 0 });
    }
    localStorage.setItem('gorilla_historico_cargas', JSON.stringify(historico));
}

window.salvarAvaliacaoFisicaCompleta = async function(e) {
    e.preventDefault();
    const alunoId = document.getElementById('aval-aluno-id').value;
    const data = document.getElementById('aval-data').value;
    const peso = parseFloat(document.getElementById('aval-peso').value);
    const altura = parseFloat(document.getElementById('aval-altura').value);
    
    const dobras = {
        torax: parseFloat(document.getElementById('dobra-torax').value),
        subescapular: parseFloat(document.getElementById('dobra-subescapular').value),
        axilar: parseFloat(document.getElementById('dobra-axilar').value),
        suprailiaca: parseFloat(document.getElementById('dobra-suprailiaca').value),
        abdominal: parseFloat(document.getElementById('dobra-abdominal').value),
        coxa: parseFloat(document.getElementById('dobra-coxa').value),
        triceps: parseFloat(document.getElementById('dobra-triceps').value)
    };

    const perimetros = {
        braco: parseFloat(document.getElementById('per-braco').value) || 0,
        cintura: parseFloat(document.getElementById('per-cintura').value) || 0,
        abdomen: parseFloat(document.getElementById('per-abdomen').value) || 0,
        quadril: parseFloat(document.getElementById('per-quadril').value) || 0,
        coxa: parseFloat(document.getElementById('per-coxa').value) || 0,
        panturrilha: parseFloat(document.getElementById('per-panturrilha').value) || 0
    };

    let alturaM = altura / 100;
    let imc = peso / (alturaM * alturaM);
    let somaDobras = dobras.torax + dobras.subescapular + dobras.axilar + dobras.suprailiaca + dobras.abdominal + dobras.coxa + dobras.triceps;
    
    let densidade = 1.112 - (0.00043499 * somaDobras) + (0.00000055 * (somaDobras * somaDobras)) - (0.00028826 * 22);
    let gorduraPerc = ((4.95 / densidade) - 4.5) * 100;
    if(gorduraPerc < 3) gorduraPerc = 5;

    let massaGordaKg = peso * (gorduraPerc / 100);
    let massaMagraKg = peso - massaGordaKg;
    
    let gorduraIdealPerc = 12.0; 
    let pesoIdealKg = massaMagraKg / (1 - (gorduraIdealPerc / 100));
    let idadeCorporal = Math.round(22 + (gorduraPerc > 18 ? (gorduraPerc - 18) * 0.8 : -2));

    try {
        await addDoc(collection(db, "avaliacoes_completas"), {
            alunoId, data, peso, altura, imc: imc.toFixed(1), gorduraPerc: gorduraPerc.toFixed(1),
            massaGordaKg: massaGordaKg.toFixed(1), massaMagraKg: massaMagraKg.toFixed(1),
            pesoIdealKg: pesoIdealKg.toFixed(1), gorduraIdealPerc, idadeCorporal,
            dobras, perimetros, createdAt: Date.now()
        });
        closeModal('modal-avaliacao');
        alert("Avaliação completa salva com sucesso!");
    } catch(err) { alert("Erro ao salvar avaliação física."); }
}

window.deletarAvaliacaoCompleta = async function(id) {
    if(confirm("Pretendes apagar esta avaliação?")) {
        await deleteDoc(doc(db, "avaliacoes_completas", id));
    }
}

window.ouvirAvaliacoesTempoReal = function() {
    const container = document.getElementById('container-avaliacoes-content');
    let role = localStorage.getItem('gorilla_role');
    let userEmail = localStorage.getItem('gorilla_user_email');

    onSnapshot(collection(db, "alunos"), (alunosSnap) => {
        let mapaAlunos = {};
        let meuAlunoId = '';
        alunosSnap.forEach(d => {
            mapaAlunos[d.id] = d.data().nome;
            if(d.data().email === userEmail) meuAlunoId = d.id;
        });

        onSnapshot(collection(db, "avaliacoes_completas"), (avalSnap) => {
            let avals = [];
            avalSnap.forEach(d => avals.push({id: d.id, ...d.data()}));
            
            if(role === 'aluno') {
                avals = avals.filter(a => a.alunoId === meuAlunoId);
            }

            if(!avals.length) {
                container.innerHTML = '<div class="bg-gorilla-card p-6 rounded-none border border-gorilla-border text-center text-xs text-gorilla-textMuted uppercase font-bold">Nenhuma avaliação física cadastrada.</div>';
                return;
            }

            container.innerHTML = `
                <div class="grid grid-cols-1 gap-6">
                    ${avals.map(a => `
                        <div class="bg-gorilla-card border border-gorilla-border p-6 rounded-none space-y-4 neon-box-olive shadow-xl">
                            <div class="flex justify-between items-center border-b border-gorilla-border pb-3">
                                <div>
                                    <span class="text-[9px] text-gorilla-olive uppercase font-extrabold tracking-widest">Atleta: ${mapaAlunos[a.alunoId] || 'Aluno'}</span>
                                    <h3 class="font-black uppercase text-white text-lg italic tracking-tight">Avaliação Antropométrica — ${a.data}</h3>
                                </div>
                                ${role === 'admin' ? `<button onclick="deletarAvaliacaoCompleta('${a.id}')" class="text-[10px] text-red-400 hover:underline uppercase font-bold">Apagar</button>` : ''}
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">Peso Atual</span>
                                    <span class="text-white text-base font-black">${a.peso} kg</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">IMC</span>
                                    <span class="text-white text-base font-black">${a.imc} <span class="text-[10px] text-gorilla-olive font-normal">(${a.imc < 25 ? 'Normal' : 'Sobrepeso'})</span></span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">% Gordura Atual</span>
                                    <span class="text-gorilla-orange text-base font-black">${a.gorduraPerc}%</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">% Gordura Ideal</span>
                                    <span class="text-gorilla-olive text-base font-black">${a.gorduraIdealPerc}%</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">Massa Magra</span>
                                    <span class="text-white text-base font-black">${a.massaMagraKg} kg</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">Massa Gorda</span>
                                    <span class="text-white text-base font-black">${a.massaGordaKg} kg</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">Peso Ideal Estatura</span>
                                    <span class="text-white text-base font-black">${a.pesoIdealKg} kg</span>
                                </div>
                                <div class="bg-gorilla-dark p-3.5 border border-gorilla-border">
                                    <span class="text-[9px] uppercase tracking-wider text-gorilla-textMuted font-bold block">Idade Corporal</span>
                                    <span class="text-gorilla-olive text-base font-black">${a.idadeCorporal} anos</span>
                                </div>
                            </div>
                        </div>`).join('')}
                </div>`;
        });
    });
}

window.renderizarGraficosEvolucaoPorExercicio = function() {
    const container = document.getElementById('container-graficos-exercicios');
    let alunoId = localStorage.getItem('gorilla_aluno_id');
    let userEmail = localStorage.getItem('gorilla_user_email');

    onSnapshot(collection(db, "alunos"), (alunosSnap) => {
        if(!alunoId) {
            alunosSnap.forEach(d => { if(d.data().email === userEmail) alunoId = d.id; });
        }

        let historico = JSON.parse(localStorage.getItem('gorilla_historico_cargas')) || {};
        let dadosAluno = historico[alunoId] || {};

        let exerciciosNomes = Object.keys(dadosAluno);
        if(!exerciciosNomes.length) {
            container.innerHTML = '<div class="bg-gorilla-card p-6 rounded-none border border-gorilla-border text-center text-xs text-gorilla-textMuted uppercase font-bold md:col-span-2">Ainda não há registros de carga nos treinos. Preencha as cargas no seu portal de treino para gerar os gráficos!</div>';
            return;
        }

        container.innerHTML = '';
        exerciciosNomes.forEach((exNome, index) => {
            let canvasId = `graficoEx_${index}`;
            container.innerHTML += `
                <div class="bg-gorilla-card border border-gorilla-border p-5 rounded-none neon-box-olive space-y-3">
                    <h3 class="font-extrabold uppercase text-white text-sm tracking-tight">${exNome}</h3>
                    <canvas id="${canvasId}" class="w-full h-60"></canvas>
                </div>`;
        });

        setTimeout(() => {
            exerciciosNomes.forEach((exNome, index) => {
                let canvasId = `graficoEx_${index}`;
                let ctx = document.getElementById(canvasId)?.getContext('2d');
                if(ctx) {
                    let regList = dadosAluno[exNome] || [];
                    let labels = regList.map(r => r.data);
                    let cargas = regList.map(r => r.carga);

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Carga (kg)',
                                data: cargas,
                                borderColor: '#657338',
                                backgroundColor: 'rgba(101, 115, 56, 0.2)',
                                borderWidth: 2,
                                tension: 0.2,
                                fill: true
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { labels: { color: '#ffffff', font: { family: 'Montserrat' } } } }, scales: { x: { ticks: { color: '#999' } }, y: { ticks: { color: '#999' } } } }
                    });
                }
            });
        }, 100);
    });
}

window.salvarJogada = async function(e) {
    e.preventDefault();
    const nome = document.getElementById('jogada-nome').value;
    const cat = document.getElementById('jogada-cat').value;
    const desc = document.getElementById('jogada-desc').value;
    try {
        await addDoc(collection(db, "jogadas"), { nome, cat, desc, createdAt: Date.now() });
        closeModal('modal-jogada');
        carregarJogadas();
    } catch(err) { alert("Erro ao salvar jogada."); }
}

window.carregarJogadas = async function() {
    const grid = document.getElementById('lista-jogadas-grid');
    grid.innerHTML = '<p class="text-xs text-gorilla-textMuted uppercase font-bold">Carregando playbook...</p>';
    const querySnapshot = await getDocs(collection(db, "jogadas"));
    grid.innerHTML = '';
    querySnapshot.forEach((docSnap) => {
        const j = docSnap.data();
        grid.innerHTML += `<div class="bg-gorilla-card p-5 rounded-none border border-gorilla-border space-y-2 neon-box-orange"><span class="text-[10px] uppercase font-extrabold text-gorilla-orange tracking-widest">${j.cat}</span><h3 class="font-black uppercase text-white tracking-tight">${j.nome}</h3><p class="text-xs text-gorilla-textMuted leading-relaxed">${j.desc}</p></div>`;
    });
}

window.salvarTreinoBasket = async function(e) {
    e.preventDefault();
    const titulo = document.getElementById('tb-titulo').value;
    const drills = document.getElementById('tb-drills').value;
    await addDoc(collection(db, "treinos_basket"), { titulo, drills });
    closeModal('modal-treino-basket');
    carregarTreinosBasket();
}
window.carregarTreinosBasket = async function() {
    const grid = document.getElementById('lista-treinos-basket-grid');
    const snap = await getDocs(collection(db, "treinos_basket"));
    grid.innerHTML = '';
    snap.forEach(d => {
        const t = d.data();
        grid.innerHTML += `<div class="bg-gorilla-card p-5 rounded-none border border-gorilla-border space-y-2 neon-box-orange"><h3 class="font-black uppercase text-white tracking-tight">${t.titulo}</h3><p class="text-xs text-gorilla-textMuted leading-relaxed">${t.drills}</p></div>`;
    });
}

window.salvarScout = async function(e) {
    e.preventDefault();
    const atleta = document.getElementById('scout-atleta').value;
    const pts = document.getElementById('scout-pts').value;
    const ast = document.getElementById('scout-ast').value;
    const reb = document.getElementById('scout-reb').value;
    await addDoc(collection(db, "scout"), { atleta, pts, ast, reb });
    closeModal('modal-scout');
    carregarScout();
}
window.carregarScout = async function() {
    const grid = document.getElementById('lista-scout-grid');
    const snap = await getDocs(collection(db, "scout"));
    grid.innerHTML = '';
    snap.forEach(d => {
        const s = d.data();
        grid.innerHTML += `<div class="bg-gorilla-card p-5 rounded-none border border-gorilla-border space-y-2 neon-box-orange"><h3 class="font-black uppercase text-white tracking-tight">${s.atleta}</h3><p class="text-xs text-gorilla-orange font-bold uppercase tracking-wider">PTS: ${s.pts} | AST: ${s.ast} | REB: ${s.reb}</p></div>`;
    });
}

window.salvarReadiness = async function(e) {
    e.preventDefault();
    const atleta = document.getElementById('rpe-atleta').value;
    const nivel = document.getElementById('rpe-nivel').value;
    await addDoc(collection(db, "readiness"), { atleta, nivel });
    closeModal('modal-readiness');
    carregarReadiness();
}
window.carregarReadiness = async function() {
    const grid = document.getElementById('lista-readiness-grid');
    const snap = await getDocs(collection(db, "readiness"));
    grid.innerHTML = '';
    snap.forEach(d => {
        const r = d.data();
        grid.innerHTML += `<div class="bg-gorilla-card p-5 rounded-none border border-gorilla-border space-y-2 neon-box-orange"><h3 class="font-black uppercase text-white tracking-tight">${r.atleta}</h3><p class="text-xs text-gorilla-orange font-bold">Nível RPE: ${r.nivel}/10</p></div>`;
    });
}

window.salvarJogo = async function(e) {
    e.preventDefault();
    const adv = document.getElementById('jogo-adv').value;
    const data = document.getElementById('jogo-data').value;
    const hora = document.getElementById('jogo-hora').value;
    await addDoc(collection(db, "jogos"), { adv, data, hora });
    closeModal('modal-jogo');
    carregarJogos();
}
window.carregarJogos = async function() {
    const grid = document.getElementById('lista-jogos-grid');
    const snap = await getDocs(collection(db, "jogos"));
    grid.innerHTML = '';
    snap.forEach(d => {
        const g = d.data();
        grid.innerHTML += `<div class="bg-gorilla-card p-5 rounded-none border border-gorilla-border space-y-2 neon-box-orange"><h3 class="font-black uppercase text-white tracking-tight">${g.adv}</h3><p class="text-xs text-gorilla-textMuted">${g.data} - ${g.hora}</p></div>`;
    });
}

window.resetarPosicoes = function() { ['1','2','3','4','5'].forEach(i => document.getElementById(`token-${i}`).style.transform = "translate(0px, 0px)"); }
window.animarJogadaPrancheta = function() {
    document.getElementById('token-1').style.transform = "translate(40px, -90px)";
    document.getElementById('token-5').style.transform = "translate(-30px, -80px)";
}