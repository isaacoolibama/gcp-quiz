import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, Percent, LogOut, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ totalParticipants: 0, avgScore: 0, questionData: [] });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "quiz_responses"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      calculateStats(data);
    });
    return () => unsubscribe();
  }, [user]);

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
      sub.answers.forEach((ans, index) => {
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
    catch (error) { alert("Acesso negado. Credenciais incorretas."); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-700">
          <div className="flex justify-center mb-6 text-emerald-400"><Lock size={48} /></div>
          <h2 className="text-2xl font-bold text-center text-white mb-6">Painel Administrativo</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">E-mail do Administrador</label>
              <input type="email" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Senha</label>
              <input type="password" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">GCP — Painel de Extensão</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhamento estatístico em tempo real</p>
        </div>
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 border border-slate-700 py-2 px-4 rounded-lg transition duration-200">
          <LogOut size={18} /> Sair
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase">Respostas Recebidas</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalParticipants}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg"><Percent size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase">Taxa Média de Acerto</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.avgScore}%</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-5">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-lg"><CheckCircle size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase">Média de Acertos / Aluno</p>
            <p className="text-3xl font-bold text-white mt-1">{((stats.avgScore * 10) / 100).toFixed(1)} / 10</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-white mb-6">Mapeamento Analítico por Questão</h3>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.questionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
              <Legend />
              <Bar dataKey="Corretas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Incorretas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
