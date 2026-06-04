export default function Footer({ light = false }) {
  const year = 2026;
  return (
    <footer className={`w-full text-center py-4 px-4 text-xs border-t ${light ? 'border-white/10 text-white/30' : 'border-slate-800 text-slate-600'}`}>
      © {year} Isaac Oolibama R. Lacerda · Todos os direitos reservados
    </footer>
  );
}
