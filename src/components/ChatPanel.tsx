import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ChatMessage } from '../types/game';

type ChatPanelProps = {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendChatMessage: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  playerName: string;
};

export function ChatPanel({ chatMessages, chatInput, setChatInput, sendChatMessage, chatEndRef, playerName }: ChatPanelProps) {
  return (
    <section className="bg-[#141414] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-80">
       <div className="bg-black/50 p-3 border-b border-white/10 flex items-center justify-between">
         <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
           <MessageSquare size={14} /> Sala de Chat
         </h2>
         <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">Temporário</span>
       </div>
       
       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
         {chatMessages.length === 0 ? (
           <div className="text-center text-gray-500 text-xs mt-4">Nenhuma mensagem ainda...</div>
         ) : (
           chatMessages.map(msg => {
             const isMe = msg.player === playerName;
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 {!isMe && <span className="text-[10px] text-gray-500 font-bold mb-0.5 px-1">{msg.player}</span>}
                 <div className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm ${isMe ? 'bg-emerald-600/80 text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
                   {msg.text}
                 </div>
               </div>
             );
           })
         )}
         <div ref={chatEndRef} />
       </div>
       
       <form onSubmit={sendChatMessage} className="p-3 bg-black/50 border-t border-white/10 flex gap-2">
         <input
           type="text"
           value={chatInput}
           onChange={(e) => setChatInput(e.target.value)}
           placeholder="Digite aqui..."
           className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/50"
         />
         <button type="submit" className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 transition-colors text-white" disabled={!chatInput.trim()}>
           <Send size={14} />
         </button>
       </form>
    </section>
  );
}
