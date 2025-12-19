
import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Share2, Maximize2, LayoutGrid, TreeDeciduous } from 'lucide-react';

interface MermaidChartProps { chart: string; }

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.1); // Phóng to nhẹ mặc định để từ khóa rõ ràng
  const [error, setError] = useState(false);

  const renderMermaid = async () => {
    if (chartRef.current && chart) {
      try {
        setError(false);
        // @ts-ignore
        const { mermaid } = window;
        if (mermaid) {
          chartRef.current.innerHTML = '';
          let code = chart.trim();
          
          if (!code.toLowerCase().startsWith('mindmap')) {
            code = `mindmap\n  root((Chủ đề))\n    ${code}`;
          }

          const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, code);
          chartRef.current.innerHTML = svg;
          
          const svgEl = chartRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.height = 'auto';
            svgEl.style.width = '100%';
            // Ép chiều ngang hẹp để bắt buộc sơ đồ trải dọc
            svgEl.style.maxWidth = '320px'; 
            svgEl.style.margin = '0 auto';
            svgEl.removeAttribute('height');
          }
        }
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        setError(true);
      }
    }
  };

  useEffect(() => {
    renderMermaid();
  }, [chart]);

  const handleReset = () => {
    setScale(1.1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-indigo-100">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100">
            <TreeDeciduous className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Sơ đồ Cây dọc</h3>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Từ khóa tối giản</p>
          </div>
        </div>
        
        <div className="flex gap-1 bg-white p-1 rounded-2xl border shadow-sm scale-90">
          <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={handleReset} className="px-3 flex items-center gap-2 hover:bg-slate-50 rounded-xl text-slate-500 border-x transition-colors">
            <RotateCcw className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Reset</span>
          </button>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"><ZoomIn className="w-4 h-4" /></button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="bg-[#fafbfd] h-[500px] overflow-auto relative cursor-grab active:cursor-grabbing p-4 no-scrollbar"
      >
        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">Lỗi cấu trúc sơ đồ</p>
            <button onClick={renderMermaid} className="bg-white border border-slate-200 px-6 py-2 rounded-full text-indigo-600 text-[10px] font-black uppercase shadow-sm">Vẽ lại</button>
          </div>
        ) : (
          <div 
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} 
            ref={chartRef} 
            className="min-w-full flex justify-center py-6"
          />
        )}
      </div>
      
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Vertical Tree Structure</p>
        <button className="text-slate-300 hover:text-emerald-600 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MermaidChart;
