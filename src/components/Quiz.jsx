import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Award } from 'lucide-react';
import Footer from './Footer';

const questionsData = [
  {
    id: 1,
    question: "Durante a nossa atividade de 'detetive dos rótulos', descobrimos que o açúcar pode se esconder nas embalagens com vários nomes. Qual das opções abaixo representa um desses 'açúcares ocultos'?",
    options: ["Xarope de milho rico em frutose", "Cloreto de sódio", "Fibra alimentar"],
    correctIndex: 0
  },
  {
    id: 2,
    question: "Nas embalagens dos lanches, o que significa encontrar um triângulo amarelo com a letra 'T' preta no centro?",
    options: ["Que o produto é livre de gorduras tóxicas", "Que o produto contém ingredientes transgênicos", "Que o produto deve ser consumido apenas à tarde"],
    correctIndex: 1
  },
  {
    id: 3,
    question: "Como uma noite de sono ruim ou o uso excessivo de celular antes de dormir afetam as nossas escolhas alimentares no dia seguinte?",
    options: ["Eles desregulam os hormônios, aumentando a fome emocional por ultraprocessados", "Eles fazem o corpo exigir apenas frutas frescas", "Eles não possuem nenhuma relação com a nossa fome"],
    correctIndex: 0
  },
  {
    id: 4,
    question: "O que melhor define a 'fome emocional' que debatemos nas dinâmicas interativas?",
    options: ["A necessidade física do corpo após 6 horas sem comer", "Vontade exclusiva de comer frutos regionais", "Comer para tentar aliviar sentimentos como tédio, ansiedade ou estresse"],
    correctIndex: 2
  },
  {
    id: 5,
    question: "O desafio 'Descascar mais, Desembalar menos' trouxe uma proposta importante. Qual é o objetivo principal desse lema?",
    options: ["Priorizar alimentos naturais e menos processados", "Aprender técnicas rápidas para abrir embalagens", "Comer apenas a casca das frutas e descartar a polpa"],
    correctIndex: 0
  },
  {
    id: 6,
    question: "Na nossa degustação, valorizamos os frutos regionais. Por que consumir frutas da nossa própria região é uma escolha excelente?",
    options: ["Porque são fabricadas com conservantes especiais", "Porque costumam ser mais frescas, nutritivas e apoiam a economia local", "Porque possuem a mesma composição de um refrigerante zero"],
    correctIndex: 1
  },
  {
    id: 7,
    question: "Na oficina de hidratação, aprendemos que a meta de água é individual. Como calcular a quantidade ideal por dia?",
    options: ["Bebendo exatamente 10 litros de água por dia", "Esperando ter a boca seca para tomar um único copo", "Multiplicando o seu próprio peso corporal (em kg) por 35 ml de água"],
    correctIndex: 2
  },
  {
    id: 8,
    question: "O que significa praticar o 'Mindful Eating' (comer com atenção plena) que exercitamos na última oficina?",
    options: ["Prestar atenção real ao sabor, textura, mastigando devagar e sem distrações de telas", "Comer o mais rápido possível para jogar no computador", "Decorar a tabela nutricional de todos os alimentos antes de comer"],
    correctIndex: 0
  },
  {
    id: 9,
    question: "Por que fomos orientados a deixar o smartphone e as telas longe do prato na hora das refeições?",
    options: ["Porque as telas nos distraem, fazendo a gente comer rápido e sem perceber a saciedade", "Porque o sinal do Wi-Fi queima as vitaminas presentes na comida quente", "Porque mexer na tela queima calorias em excesso antes de mastigar"],
    correctIndex: 0
  },
  {
    id: 10,
    question: "Se quisermos aplicar o aprendizado de todas as oficinas na nossa rotina, qual seria a melhor atitude para o lanche da escola?",
    options: ["Trocar o almoço por dois pacotes de salgadinho industrializado", "Levar uma fruta regional, garrafa de água para seu peso e comer com atenção plena", "Ficar sem comer nada o dia inteiro e focar apenas nas redes sociais"],
    correctIndex: 1
  }
];

export default function Quiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [sending, setSending] = useState(false);

  const handleAnswer = async (selectedOptionIndex) => {
    if (sending) return;
    const isCorrect = selectedOptionIndex === questionsData[currentIdx].correctIndex;
    const updatedAnswers = [...userAnswers, { questionId: questionsData[currentIdx].id, isCorrect }];
    const nextScore = isCorrect ? score + 1 : score;

    setUserAnswers(updatedAnswers);
    setScore(nextScore);

    if (currentIdx + 1 < questionsData.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSending(true);
      try {
        await addDoc(collection(db, "quiz_responses"), {
          score: nextScore,
          answers: updatedAnswers,
          submittedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Erro ao enviar:", err);
      }
      setSending(false);
      setQuizFinished(true);
    }
  };

  if (sending && currentIdx + 1 >= questionsData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 text-white">
        <p className="text-xl animate-pulse">Enviando respostas...</p>
        <Footer light />
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 pb-16 text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md w-full text-center border border-white/20 shadow-2xl">
          <Award className="mx-auto text-amber-400 mb-4" size={64} />
          <h2 className="text-3xl font-bold mb-2">Parabéns!</h2>
          <p className="text-purple-200 mb-6">Você completou o desafio da atividade de extensão!</p>
          <div className="bg-purple-950/40 p-4 rounded-xl border border-white/10 mb-6">
            <span className="text-sm block text-purple-300 uppercase font-semibold">Seu total de acertos</span>
            <span className="text-5xl font-black text-emerald-400">{score} <span className="text-2xl text-white">/10</span></span>
          </div>
          <p className="text-xs text-purple-300">Suas respostas foram salvas e enviadas para o painel da professora.</p>
        </div>
        <Footer light />
      </div>
    );
  }

  const currentQuestion = questionsData[currentIdx];
  const progress = ((currentIdx + 1) / questionsData.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 pb-16">
      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
            Atividade de Extensão
          </span>
          <span className="text-sm font-medium text-slate-400">
            {currentIdx + 1} / {questionsData.length}
          </span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-8 leading-snug">
          {currentQuestion.question}
        </h2>
        <div className="space-y-3">
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={sending}
              className="w-full text-left bg-slate-700/50 hover:bg-indigo-600/30 border border-slate-600/70 hover:border-indigo-500 text-slate-200 hover:text-white p-4 rounded-xl font-medium transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-3">
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-slate-600 text-slate-300 text-sm font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
