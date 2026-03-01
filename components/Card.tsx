export const Card = ({ title, children, description, className = "" }: { title?: string, children: React.ReactNode, description?: string, className?: string }) => (
    <div className={`bg-zinc-900/40 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm hover:border-white/10 transition-all duration-500 ${className}`}>
        {title && (
            <div className="mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#CC5500]"></span>
                    {title}
                </h2>
                {description && <p className="text-[10px] text-zinc-600 mt-1 italic leading-relaxed">{description}</p>}
            </div>
        )}
        {children}
    </div>
);