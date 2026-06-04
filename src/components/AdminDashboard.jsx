import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, Percent, LogOut, Lock, Trash2, BarChart2, List, Share2 } from 'lucide-react';
import Footer from './Footer';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ totalParticipants: 0, avgScore: 0, questionData: [] });
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "quiz_responses"), (snapshot) => {
      const data = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0));
      setResponses(data);
      calculateStats(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Deletar esta resposta?")) return;
    await deleteDoc(doc(db, "quiz_responses", id));
  };

  const calculateStats = (data) => {
    const total = data.length;
    const qCounters = Array.from({ length: 10 }, (_, i) => ({ name: `Q${i + 1}`, Corretas: 0, Incorretas: 0 }));
    if (total === 0) {
      setStats({ totalParticipants: 0, avgScore: 0, questionData: qCounters });
      return;
    }
    let totalCorrectAll = 0;
    data.forEach(sub => {
      totalCorrectAll += sub.score;
      sub.answers?.forEach((ans, index) => {
        if (index < 10) {
          if (ans.isCorrect) qCounters[index].Corretas += 1;
          else qCounters[index].Incorretas += 1;
        }
      });
    });
    setStats({
      totalParticipants: total,
      avgScore: ((totalCorrectAll / (total * 10)) * 100).toFixed(1),
      questionData: qCounters
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { alert("Acesso negado. Credenciais incorretas."); }
  };

  const handleShare = async () => {
    const url = 'https://gcp-quiz.vercel.app';
    const shareData = {
      title: 'Quiz — Educação Alimentar e Nutricional',
      text: 'Responda o quiz da atividade de extensão!',
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      window.open(url, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700 mb-12">
          <div className="flex justify-center mb-5 text-emerald-400"><Lock size={44} /></div>
          <h2 className="text-xl font-bold text-center text-white mb-6">Painel Administrativo</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">E-mail</label>
              <input
                type="email"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3.5 text-white text-base focus:border-emerald-500 focus:outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Senha</label>
              <input
                type="password"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3.5 text-white text-base focus:border-emerald-500 focus:outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-base">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const scoreColor = (score) => {
    if (score >= 7) return 'text-emerald-400';
    if (score >= 5) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreBg = (score) => {
    if (score >= 7) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 5) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="min-w-0">
          <h1 className="text-base md:text-xl font-bold text-white truncate">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border border-indigo-500 py-2 px-3 rounded-lg transition duration-200 text-sm"
            title="Compartilhar quiz"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 border border-slate-700 py-2 px-3 rounded-lg transition duration-200 text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition duration-200 border-b-2 ${
            activeTab === 'stats'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 active:text-white'
          }`}
        >
          <BarChart2 size={16} />
          Estatísticas
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition duration-200 border-b-2 ${
            activeTab === 'responses'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 active:text-white'
          }`}
        >
          <List size={16} />
          Respostas
          <span className="bg-slate-700 text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {responses.length}
          </span>
        </button>
      </div>

      <div className="p-4 md:p-8 pb-16">

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-6">
              <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl flex items-center gap-3 md:gap-5">
                <div className="p-2.5 md:p-4 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                  <Users size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase leading-tight">Respostas</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.totalParticipants}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl flex items-center gap-3 md:gap-5">
                <div className="p-2.5 md:p-4 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                  <Percent size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase leading-tight">Média Acerto</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.avgScore}%</p>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl flex items-center gap-3 md:gap-5">
                <div className="p-2.5 md:p-4 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                  <CheckCircle size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase leading-tight">Média / Aluno</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {((stats.avgScore * 10) / 100).toFixed(1)} <span className="text-base text-slate-400">/ 10</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4">Acertos por Questão</h3>
              <div className="w-full h-56 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.questionData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: 13 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="Corretas" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Incorretas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div>
            {responses.length === 0 ? (
              <div className="text-center py-20">
                <List size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma resposta recebida ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((r, idx) => (
                  <div key={r.id} className={`bg-slate-900 border rounded-xl p-4 ${scoreBg(r.score)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`text-2xl font-black shrink-0 ${scoreColor(r.score)}`}>
                          {r.score}<span className="text-sm font-semibold text-slate-400">/10</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 font-medium">
                            #{responses.length - idx}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {r.submittedAt
                              ? new Date(r.submittedAt.seconds * 1000).toLocaleString('pt-BR', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="shrink-0 p-2.5 rounded-lg text-slate-600 active:text-red-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-800/60">
                      {r.answers?.map((a, i) => (
                        <span
                          key={i}
                          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-bold ${
                            a.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
