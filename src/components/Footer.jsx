export default function Footer({ light = false }) {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 text-center py-3 px-4 text-xs border-t z-50 ${light ? 'bg-indigo-950/80 border-white/10 text-white/40' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
      Desenvolvido por: Isaac Oolibama R. Lacerda · © 2026
    </footer>
  );
}
