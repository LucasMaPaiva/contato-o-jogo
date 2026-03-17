import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Zap, Shield } from 'lucide-react';

type RulesModalProps = {
  showRules: boolean;
  setShowRules: (show: boolean) => void;
};

export function RulesModal({ showRules, setShowRules }: RulesModalProps) {
  return (
    <AnimatePresence>
      {showRules && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pt-16 lg:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
          >
            <button 
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                 <HelpCircle size={20} /> 
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Como Jogar Contato</h2>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <p>O <strong>Contato</strong> é um jogo cooperativo de adivinhação. O objetivo é que os adivinhadores descubram a <strong className="text-emerald-400">Palavra Secreta</strong> definida pelo Mestre.</p>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">A Dinâmica</h3>
                <ul className="list-disc pl-4 space-y-1.5 marker:text-emerald-500/50">
                  <li>O <strong>Mestre</strong> pensa numa Palavra Secreta e o jogo mostra apenas ela em branco.</li>
                  <li>No início (e a cada Contato com Sucesso), as letras vão sendo reveladas da primeira pra última (ex: "A", dps "AM", dps "AMI", etc).</li>
                  <li>O objetivo dos adivinhadores (os outros) é ir sugerindo palavras-pista que <strong className="text-white">COMEÇAM COM AS MESMAS LETRAS ATUAIS</strong> reveladas.</li>
                  <li><strong>Exemplo:</strong> Se a palavra é "Amizade" e não há letras, um jogador envia a pista "Fruta ácida e amarela" e diz pro jogo que a palavra dele é "Abacaxi".</li>
                </ul>
              </div>

              <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 space-y-3 mt-4">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Zap size={14} /> Contato!</h3>
                <p>O jogador envia a pista para que os DEMAIS leiam e tentem pensar na mesma palavra que ele. Quando outro adivinhador acha que sabe a resposta para a pista (ex: descobre que é "Abacaxi"), ele aperta em <strong>CONTATO</strong>!</p>
                <ul className="list-disc pl-4 space-y-1.5 text-emerald-200/80 marker:text-emerald-500">
                  <li>Inicia-se uma contagem regressiva de 1 segundo.</li>
                  <li>No final, as palavras dos dois jogadores (o Autor da pista e quem tentou o Contato) são reveladas ao Mestre.</li>
                  <li><strong>Se as palavras baterem</strong>: O Contato foi um SUCESSO! O Mestre é forçado a revelar <strong>mais 1 letra</strong> da sua Palavra Secreta Oficial.</li>
                  <li><strong>Se não baterem</strong>: A pista morre (Falhou), e o Mestre respira aliviado.</li>
                </ul>
              </div>

              <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20 space-y-3 mt-4">
                <h3 className="text-red-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Shield size={14} /> A Defesa do Mestre</h3>
                <p>O Mestre entra em desespero quando vê que o grupo deu Contato e o 1 segundo está rolando. A meta do Mestre é não deixar os jogadores ganharem letras!</p>
                <ul className="list-disc pl-4 space-y-1.5 text-red-200/80 marker:text-red-500">
                  <li>Para "Quebrar" o contato, o Mestre deve ler a pista que o Autor deu, e durante o tempo correr para adivinhar qual é ela.</li>
                  <li>Se o Mestre acertar e apertar o botão de Quebrar antes de dar contato, a palavra da pista fica <strong>Queimada/Bloqueada</strong> e ninguém consegue completá-la.</li>
                </ul>
              </div>

              <div className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-500/20 space-y-3 mt-4">
                <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-xs">👑 Condição de Vitória</h3>
                <p>A qualquer momento — seja por completarem a palavra ou porque a dica oficial do um autor já era logo de cara a própria <strong>Palavra Secreta Oculta</strong> — quando os Adivinhadores dão palpite exato à do Mestre, a vitória Global acontece instantaneamente.</p>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowRules(false)}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl text-white font-bold transition-colors"
               >
                Entendi, Vamos Jogar!
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
