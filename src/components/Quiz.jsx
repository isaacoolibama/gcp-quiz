import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import Footer from './Footer';

const PHRASES = [
  "Cada escolha saudável é um passo em direção ao seu melhor eu! Continue assim!",
  "O conhecimento sobre o que você come é a maior ferramenta para sua saúde. Parabéns!",
  "Alimentar-se bem é um ato de amor próprio. Você está no caminho certo!",
  "Saber o que está no seu prato é poder. Você saiu daqui mais consciente!",
  "A saúde começa no prato — e você já deu o primeiro passo sabendo o que evitar!",
  "Descascar mais e desembalar menos começa com a consciência que você demonstrou hoje!",
  "Pequenas mudanças na alimentação geram grandes transformações na saúde. Você já entende isso!",
  "A autonomia em saúde começa com informação. Hoje você provou que está no caminho!",
  "Conhecimento é o melhor nutriente! Continue se alimentando de boas informações!",
  "Sua participação planta sementes de saúde para o futuro. Obrigado(a) por estar aqui!",
  "Você demonstrou que aprendeu de verdade! Leve esse conhecimento para o seu dia a dia.",
  "Parabéns! Cada questão respondida representa um futuro mais saudável para você!",
  "O primeiro passo para uma vida saudável é a consciência — e você a demonstrou aqui!",
  "Seu corpo agradece cada escolha consciente. Continue aprendendo e crescendo!",
  "Você não come só para sobreviver — você come para viver melhor. Parabéns pela consciência!"
];

const questionsData = [
  {
    id: 1,
    question: "Durante a nossa atividade de 'detetive dos rótulos', descobrimos que o açúcar pode se esconder nas embalagens com vários nomes. Qual das opções abaixo representa um desses 'açúcares ocultos'?",
    options: ["Xarope de milho rico em frutose", "Cloreto de sódio", "Fibra alimentar"],
    correctIndex: 0,
    explanation: "O xarope de milho rico em frutose é um adoçante industrializado muito usado em ultraprocessados. Os fabricantes usam esse nome justamente para que o consumidor não reconheça o açúcar na lista de ingredientes."
  },
  {
    id: 2,
    question: "Nas embalagens dos lanches, o que significa encontrar um triângulo amarelo com a letra 'T' preta no centro?",
    options: ["Que o produto é livre de gorduras tóxicas", "Que o produto contém ingredientes transgênicos", "Que o produto deve ser consumido apenas à tarde"],
    correctIndex: 1,
    explanation: "O triângulo amarelo com 'T' é o símbolo obrigatório no Brasil para alimentos transgênicos (geneticamente modificados). Saber reconhecê-lo nos rótulos é fundamental para fazer escolhas conscientes!"
  },
  {
    id: 3,
    question: "Como uma noite de sono ruim ou o uso excessivo de celular antes de dormir afetam as nossas escolhas alimentares no dia seguinte?",
    options: ["Eles desregulam os hormônios, aumentando a fome emocional por ultraprocessados", "Eles fazem o corpo exigir apenas frutas frescas", "Eles não possuem nenhuma relação com a nossa fome"],
    correctIndex: 0,
    explanation: "Dormir mal eleva o cortisol e reduz a leptina (hormônio da saciedade), aumentando a grelina (hormônio da fome). Isso faz o corpo buscar energia rápida em ultraprocessados, ricos em açúcar e gordura."
  },
  {
    id: 4,
    question: "O que melhor define a 'fome emocional' que debatemos nas dinâmicas interativas?",
    options: ["A necessidade física do corpo após 6 horas sem comer", "Vontade exclusiva de comer frutos regionais", "Comer para tentar aliviar sentimentos como tédio, ansiedade ou estresse"],
    correctIndex: 2,
    explanation: "A fome emocional surge de repente, foca em alimentos específicos (geralmente ultraprocessados) e está ligada a emoções como estresse, tédio ou ansiedade — não à necessidade real de nutrientes do corpo."
  },
  {
    id: 5,
    question: "O desafio 'Descascar mais, Desembalar menos' trouxe uma proposta importante. Qual é o objetivo principal desse lema?",
    options: ["Priorizar alimentos naturais e menos processados", "Aprender técnicas rápidas para abrir embalagens", "Comer apenas a casca das frutas e descartar a polpa"],
    correctIndex: 0,
    explanation: "O lema incentiva o consumo de alimentos in natura — frutas, legumes, verduras — em vez de produtos industrializados embalados, que geralmente contêm aditivos, excesso de sódio e açúcar."
  },
  {
    id: 6,
    question: "Na nossa degustação, valorizamos os frutos regionais. Por que consumir frutas da nossa própria região é uma escolha excelente?",
    options: ["Porque são fabricadas com conservantes especiais", "Porque costumam ser mais frescas, nutritivas e apoiam a economia local", "Porque possuem a mesma composição de um refrigerante zero"],
    correctIndex: 1,
    explanation: "Frutas regionais chegam mais frescas, sem precisar de conservantes para transporte. São adaptadas ao clima local, geralmente mais nutritivas, e seu consumo fortalece a economia da comunidade."
  },
  {
    id: 7,
    question: "Na oficina de hidratação, aprendemos que a meta de água é individual. Como calcular a quantidade ideal por dia?",
    options: ["Bebendo exatamente 10 litros de água por dia", "Esperando ter a boca seca para tomar um único copo", "Multiplicando o seu próprio peso corporal (em kg) por 35 ml de água"],
    correctIndex: 2,
    explanation: "A fórmula recomendada é: peso (kg) × 35 ml. Exemplo: uma pessoa de 60 kg deve beber aproximadamente 2.100 ml (2,1 litros) por dia. A boca seca é sinal de desidratação — não espere chegar lá!"
  },
  {
    id: 8,
    question: "O que significa praticar o 'Mindful Eating' (comer com atenção plena) que exercitamos na última oficina?",
    options: ["Prestar atenção real ao sabor, textura, mastigando devagar e sem distrações de telas", "Comer o mais rápido possível para jogar no computador", "Decorar a tabela nutricional de todos os alimentos antes de comer"],
    correctIndex: 0,
    explanation: "Comer com atenção plena significa estar presente na refeição: perceber sabores, cheiros e texturas, mastigar devagar e evitar distrações. Isso melhora a digestão e evita o excesso alimentar."
  },
  {
    id: 9,
    question: "Por que fomos orientados a deixar o smartphone e as telas longe do prato na hora das refeições?",
    options: ["Porque as telas nos distraem, fazendo a gente comer rápido e sem perceber a saciedade", "Porque o sinal do Wi-Fi queima as vitaminas presentes na comida quente", "Porque mexer na tela queima calorias em excesso antes de mastigar"],
    correctIndex: 0,
    explanation: "Quando estamos distraídos com telas, o cérebro não registra corretamente os sinais de saciedade. Resultado: comemos mais rápido, em maior quantidade, sem perceber quando estamos satisfeitos."
  },
  {
    id: 10,
    question: "Se quisermos aplicar o aprendizado de todas as oficinas na nossa rotina, qual seria a melhor atitude para o lanche da escola?",
    options: ["Trocar o almoço por dois pacotes de salgadinho industrializado", "Levar uma fruta regional, garrafa de água para seu peso e comer com atenção plena", "Ficar sem comer nada o dia inteiro e focar apenas nas redes sociais"],
    correctIndex: 1,
    explanation: "Uma fruta regional oferece vitaminas e fibras, a garrafa de água garante hidratação adequada, e comer com atenção plena permite perceber a saciedade. Essa combinação resume todo o aprendizado da atividade!"
  }
];

const scoreInfo = (score) => {
  if (score >= 9) return { label: 'Excelente!', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (score >= 7) return { label: 'Muito Bom!', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
  if (score >= 5) return { label: 'Bom Trabalho!', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  return { label: 'Continue Aprendendo!', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
};

export default function Quiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [sending, setSending] = useState(false);
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);

  const handleSelect = (optionIdx) => {
    if (showFeedback || sending) return;
    const isCorrect = optionIdx === questionsData[currentIdx].correctIndex;
    setSelectedIdx(optionIdx);
    setShowFeedback(true);
    if (isCorrect) setScore(s => s + 1);
    setUserAnswers(prev => [...prev, { questionId: questionsData[currentIdx].id, isCorrect }]);
  };

  const handleNext = async () => {
    const isLast = currentIdx + 1 >= questionsData.length;
    if (!isLast) {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "quiz_responses"), {
        score,
        answers: userAnswers,
        submittedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
    setSending(false);
    setQuizFinished(true);
  };

  const optionStyle = (i) => {
    const base = 'w-full text-left border p-4 rounded-xl font-medium transition-all duration-150';
    if (!showFeedback) return `${base} bg-slate-700/50 hover:bg-indigo-600/30 border-slate-600/70 hover:border-indigo-500 text-slate-200 hover:text-white active:scale-[0.99]`;
    const correct = questionsData[currentIdx].correctIndex;
    if (i === correct) return `${base} bg-emerald-500/15 border-emerald-500 text-emerald-300`;
    if (i === selectedIdx) return `${base} bg-red-500/15 border-red-500 text-red-300`;
    return `${base} border-slate-700/30 text-slate-600 cursor-default`;
  };

  if (sending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 text-white">
        <p className="text-xl animate-pulse">Enviando respostas...</p>
        <Footer light />
      </div>
    );
  }

  if (quizFinished) {
    const info = scoreInfo(score);
    const corretas = userAnswers.filter(a => a.isCorrect).length;
    const incorretas = userAnswers.length - corretas;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4 pb-16 text-white">
        <div className="w-full max-w-sm space-y-4">

          <div className="text-center">
            <Award className="mx-auto text-amber-400 mb-3" size={56} />
            <h2 className="text-3xl font-bold">Parabéns!</h2>
            <p className="text-purple-200 mt-1 text-sm">Você completou o questionário</p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-xs text-purple-300 uppercase font-semibold text-center mb-3">Seu total de acertos</p>
            <p className="text-center">
              <span className={`text-6xl font-black ${info.color}`}>{score}</span>
              <span className="text-2xl text-white/50"> / 10</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-center">
                <CheckCircle className="mx-auto text-emerald-400 mb-1" size={20} />
                <p className="text-2xl font-black text-emerald-400">{corretas}</p>
                <p className="text-xs text-emerald-300/70 uppercase font-medium mt-0.5">Corretas</p>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center">
                <XCircle className="mx-auto text-red-400 mb-1" size={20} />
                <p className="text-2xl font-black text-red-400">{incorretas}</p>
                <p className="text-xs text-red-300/70 uppercase font-medium mt-0.5">Incorretas</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-purple-200">
            ✓ Suas respostas foram salvas e enviadas.
          </p>
        </div>
        <Footer light />
      </div>
    );
  }

  const currentQuestion = questionsData[currentIdx];
  const progress = ((currentIdx + 1) / questionsData.length) * 100;
  const isCorrectAnswer = selectedIdx === currentQuestion.correctIndex;
  const isLast = currentIdx + 1 >= questionsData.length;

  return (
    <div className="min-h-screen bg-slate-900 flex items-start justify-center p-4 pb-16 pt-6">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-xl overflow-hidden">

        <div className="p-5 md:p-7">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
              Quiz — Atividade de Extensão
            </span>
            <span className="text-sm font-medium text-slate-400">
              {currentIdx + 1} / {questionsData.length}
            </span>
          </div>

          <div className="w-full bg-slate-700 h-1.5 rounded-full mb-5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-base md:text-lg font-bold text-white mb-5 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-2.5 mb-4">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={optionStyle(i)}
              >
                <span className="inline-flex items-center gap-3">
                  <span className={`w-7 h-7 flex-shrink-0 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                    showFeedback && i === currentQuestion.correctIndex ? 'bg-emerald-500 text-white' :
                    showFeedback && i === selectedIdx ? 'bg-red-500 text-white' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {showFeedback && i === currentQuestion.correctIndex ? '✓' :
                     showFeedback && i === selectedIdx ? '✗' :
                     String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`rounded-xl p-4 border mb-4 ${isCorrectAnswer ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}`}>
              <p className={`text-sm font-bold mb-1 ${isCorrectAnswer ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrectAnswer ? '✓ Isso mesmo!' : '✗ Não foi dessa vez'}
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {showFeedback && (
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 flex items-center justify-center gap-2 transition-colors text-base"
          >
            {isLast ? 'Ver Resultado' : 'Próxima Questão'}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
}
