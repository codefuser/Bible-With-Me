import React from 'react';
import {
  Sparkles, Palette, Image as ImageIcon, Type, BookOpen,
  Square, Layers, Wand2, Award, ChevronLeft, ChevronRight
} from 'lucide-react';

export type StudioNavTabId =
  | 'templates'
  | 'background'
  | 'photos'
  | 'text'
  | 'bible'
  | 'elements'
  | 'shapes'
  | 'layers'
  | 'effects'
  | 'brand';

interface StudioLeftNavProps {
  activeTab: StudioNavTabId | null;
  onSelectTab: (tab: StudioNavTabId) => void;
  isTa?: boolean;
}

interface NavItem {
  id: StudioNavTabId;
  label: string;
  labelTa: string;
  icon: React.ReactNode;
}

export const StudioLeftNav: React.FC<StudioLeftNavProps> = ({
  activeTab,
  onSelectTab,
  isTa
}) => {
  const NAV_ITEMS: NavItem[] = [
    {
      id: 'templates',
      label: 'Templates',
      labelTa: 'வார்ப்புருக்கள்',
      icon: <Sparkles size={20} />
    },
    {
      id: 'background',
      label: 'Background',
      labelTa: 'பின்னணி',
      icon: <Palette size={20} />
    },
    {
      id: 'photos',
      label: 'Photos',
      labelTa: 'புகைப்படம்',
      icon: <ImageIcon size={20} />
    },
    {
      id: 'text',
      label: 'Text',
      labelTa: 'உரை',
      icon: <Type size={20} />
    },
    {
      id: 'bible',
      label: 'Scripture',
      labelTa: 'வேதாகமம்',
      icon: <BookOpen size={20} />
    },
    {
      id: 'elements',
      label: 'Symbols',
      labelTa: 'சின்னங்கள்',
      icon: <Sparkles size={20} />
    },
    {
      id: 'shapes',
      label: 'Shapes',
      labelTa: 'வடிவங்கள்',
      icon: <Square size={20} />
    },
    {
      id: 'layers',
      label: 'Layers',
      labelTa: 'அடுக்குகள்',
      icon: <Layers size={20} />
    },
    {
      id: 'effects',
      label: 'Effects',
      labelTa: 'விளைவுகள்',
      icon: <Wand2 size={20} />
    },
    {
      id: 'brand',
      label: 'Brand',
      labelTa: 'முத்திரை',
      icon: <Award size={20} />
    }
  ];

  return (
    <nav className="studio-left-nav" aria-label="Creative Studio Tools">
      {NAV_ITEMS.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`studio-nav-btn ${isActive ? 'active' : ''}`}
            title={isTa ? item.labelTa : item.label}
          >
            <div className="studio-nav-icon">
              {item.icon}
            </div>
            <span className="studio-nav-label">
              {isTa ? item.labelTa : item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
