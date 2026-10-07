import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { StudioProject, ElementLayer } from '../types';
import { STUDIO_ELEMENTS, StudioElementDef } from '../studioElements';

interface ElementsPanelProps {
  project: StudioProject;
  onAddLayer: (layer: ElementLayer) => void;
  isTa?: boolean;
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({
  project,
  onAddLayer,
  isTa
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { width: canvasW, height: canvasH } = project.canvas;

  const categories = ['All', ...Array.from(new Set(STUDIO_ELEMENTS.map(e => e.category)))];

  const filteredElements = selectedCategory === 'All'
    ? STUDIO_ELEMENTS
    : STUDIO_ELEMENTS.filter(e => e.category === selectedCategory);

  const handleAddElement = (elem: StudioElementDef) => {
    const size = Math.round(canvasW * 0.12);
    const newLayer: ElementLayer = {
      id: `elem-${Date.now()}`,
      name: elem.name,
      type: 'element',
      elementId: elem.id,
      svgPath: elem.svgPath,
      x: (canvasW - size) / 2,
      y: canvasH * 0.18,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      color: elem.defaultColor,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 10
    };
    onAddLayer(newLayer);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Sparkles size={18} className="text-amber-400" />
          <span>{isTa ? 'ஆன்மீக சின்னங்கள் & அலங்காரங்கள்' : 'Christian Symbols & Icons'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'சிலுவை, புறா, வேதாகமம் மற்றும் கிருபையின் சின்னங்களை கார்டில் சேர்க்கவும்'
            : 'Add sacred crosses, holy spirit doves, open scriptures, and faith emblems.'}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredElements.map(elem => (
          <button
            key={elem.id}
            onClick={() => handleAddElement(elem)}
            className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all text-center relative"
          >
            <div className="w-12 h-12 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
              <svg
                viewBox={elem.viewBox}
                className="w-10 h-10 drop-shadow-md"
                fill={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? 'none' : elem.defaultColor}
                stroke={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? elem.defaultColor : 'none'}
                strokeWidth={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? 2 : 0}
              >
                <path d={elem.svgPath} />
              </svg>
            </div>

            <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate w-full">
              {isTa ? elem.nameTa : elem.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{elem.category}</div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-slate-950 p-1 rounded-full">
              <Plus size={10} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
