import React, { useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import { Settings as SettingsIcon, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function ResponsiveGrid({ children, ...props }: any) {
  const [width, setWidth] = React.useState(1200);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(entries => {
      if (entries[0].contentRect.width > 0) {
        setWidth(entries[0].contentRect.width);
      }
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      <Responsive width={width} {...props}>
        {children}
      </Responsive>
    </div>
  );
}

// Widget Types
export type WidgetType = 
  | 'clock' | 'weather' | 'calendar' | 'media' | 'note' | 'photo' 
  | 'stats' | 'github' | 'todo' | 'quote' | 'countdown' | 'battery' 
  | 'news' | 'youtube' | 'links' | 'discord' | 'timers';

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_WIDGETS: WidgetData[] = [
  { id: 'clock-1', type: 'clock', title: 'Clock', x: 0, y: 0, w: 4, h: 2 },
  { id: 'weather-1', type: 'weather', title: 'Weather', x: 4, y: 0, w: 2, h: 2 },
  { id: 'calendar-1', type: 'calendar', title: 'Calendar', x: 6, y: 0, w: 4, h: 4 },
  { id: 'todo-1', type: 'todo', title: 'Tasks', x: 0, y: 2, w: 2, h: 4 },
  { id: 'note-1', type: 'note', title: 'Quick Note', x: 2, y: 2, w: 2, h: 4 },
  { id: 'battery-1', type: 'battery', title: 'Battery', x: 4, y: 2, w: 2, h: 1 },
  { id: 'quote-1', type: 'quote', title: 'Quote', x: 4, y: 3, w: 2, h: 1 },
];

export default function Dashboard() {
  const [widgets, setWidgets] = useState<WidgetData[]>(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [quickLaunch, setQuickLaunch] = useState<{name: string, url: string}[]>(() => {
    const saved = localStorage.getItem('dashboard-quicklaunch');
    return saved ? JSON.parse(saved) : [
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'YouTube', url: 'https://youtube.com' },
      { name: 'Discord', url: 'https://discord.com' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('dashboard-quicklaunch', JSON.stringify(quickLaunch));
  }, [quickLaunch]);

  const addQuickLaunch = () => {
    const name = prompt('App Name?');
    const url = prompt('URL?');
    if (name && url) {
      setQuickLaunch([...quickLaunch, { name, url }]);
    }
  };

  const onLayoutChange = (currentLayout: any[]) => {
    if (!isEditMode) return;
    const updatedWidgets = widgets.map(w => {
      const layoutItem = currentLayout.find(l => l.i === w.id);
      if (layoutItem) {
        return { ...w, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
      }
      return w;
    });
    setWidgets(updatedWidgets);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const addWidget = (type: WidgetType) => {
    const id = `${type}-${Date.now()}`;
    const newWidget: WidgetData = {
      id,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      x: 0,
      y: Infinity, // Put at bottom
      w: 2,
      h: 2
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Chill Dashboard</h1>
          <p className="text-sm text-zinc-500 italic">Your second monitor companion</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Quick Launch:</span>
            {quickLaunch.map(app => (
              <a key={app.name} href={app.url} target="_blank" className="text-xs text-zinc-400 hover:text-white transition-colors">{app.name}</a>
            ))}
            {isEditMode && (
              <button onClick={addQuickLaunch} className="p-1 bg-zinc-800 rounded-full text-zinc-500 hover:text-white">
                <Plus size={12} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
              isEditMode 
                ? "bg-white text-black border-white" 
                : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600"
            )}
          >
            <SettingsIcon size={18} />
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </header>

      <ResponsiveGrid
        className="layout"
        layouts={{ lg: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h })) }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".drag-handle"
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={onLayoutChange}
        margin={[16, 16]}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="group relative">
            <WidgetWrapper 
              widget={widget} 
              isEditMode={isEditMode} 
              onRemove={() => removeWidget(widget.id)} 
            />
          </div>
        ))}
      </ResponsiveGrid>

      {isEditMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex gap-3 overflow-x-auto max-w-[90vw] shadow-2xl z-50">
          {(['clock', 'weather', 'calendar', 'media', 'note', 'photo', 'stats', 'github', 'todo', 'quote', 'countdown', 'battery', 'news', 'youtube', 'links', 'discord', 'timers'] as WidgetType[]).map(type => (
            <button
              key={type}
              onClick={() => addWidget(type)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs whitespace-nowrap transition-colors"
            >
              + {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WidgetWrapper({ widget, isEditMode, onRemove }: { widget: WidgetData, isEditMode: boolean, onRemove: () => void }) {
  return (
    <div className={cn(
      "w-full h-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden flex flex-col transition-all",
      isEditMode && "ring-2 ring-blue-500/50 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
    )}>
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button onClick={onRemove} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-full transition-colors">
            <Trash2 size={14} />
          </button>
          <div className="drag-handle p-1.5 bg-zinc-800 text-zinc-400 cursor-grab active:cursor-grabbing rounded-full">
            <GripVertical size={14} />
          </div>
        </div>
      )}
      <div className="flex-1 p-4 overflow-auto">
        <WidgetContent type={widget.type} />
      </div>
    </div>
  );
}

// Placeholder for WidgetContent - will be expanded
function WidgetContent({ type }: { type: WidgetType }) {
  switch (type) {
    case 'clock': return <ClockWidget />;
    case 'weather': return <WeatherWidget />;
    case 'calendar': return <CalendarWidget />;
    case 'todo': return <TodoWidget />;
    case 'note': return <NoteWidget />;
    case 'battery': return <BatteryWidget />;
    case 'quote': return <QuoteWidget />;
    case 'media': return <MediaWidget />;
    case 'photo': return <PhotoWidget />;
    case 'stats': return <StatsWidget />;
    case 'github': return <GithubWidget />;
    case 'countdown': return <CountdownWidget />;
    case 'news': return <NewsWidget />;
    case 'youtube': return <YoutubeWidget />;
    case 'links': return <LinksWidget />;
    case 'discord': return <DiscordWidget />;
    case 'timers': return <TimersWidget />;
    default: return <div className="text-zinc-600">Widget: {type}</div>;
  }
}

// --- Widget Implementations ---

function ClockWidget() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="text-6xl font-light tracking-tighter text-white">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
      <div className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

function WeatherWidget() {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-4xl font-light">22°</div>
        <div className="text-zinc-400">Sunny</div>
      </div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider">San Francisco</div>
    </div>
  );
}

function CalendarWidget() {
  const now = new Date();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-4 text-zinc-400">{now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-600 mb-2">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: 31 }).map((_, i) => (
          <div key={i} className={cn(
            "aspect-square flex items-center justify-center text-xs rounded-lg",
            i + 1 === now.getDate() ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800"
          )}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoWidget() {
  const [todos, setTodos] = useState<{id: string, text: string, done: boolean}[]>(() => {
    const saved = localStorage.getItem('widget-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => localStorage.setItem('widget-todos', JSON.stringify(todos)), [todos]);

  const add = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: input, done: false }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">To-Do List</div>
      <div className="flex-1 overflow-auto space-y-2 mb-4">
        {todos.map(t => (
          <div key={t.id} className="flex items-center gap-2 group">
            <input 
              type="checkbox" 
              checked={t.done} 
              onChange={() => setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x))}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800"
            />
            <span className={cn("text-sm flex-1", t.done && "line-through text-zinc-600")}>{t.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add task..."
          className="flex-1 bg-zinc-800 border-none rounded-lg px-3 py-1.5 text-xs focus:ring-1 ring-zinc-700"
        />
        <button onClick={add} className="p-1.5 bg-zinc-700 rounded-lg"><Plus size={14}/></button>
      </div>
    </div>
  );
}

function NoteWidget() {
  const [note, setNote] = useState(() => localStorage.getItem('widget-note') || '');
  useEffect(() => localStorage.setItem('widget-note', note), [note]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Quick Note</div>
      <textarea 
        value={note}
        onChange={e => setNote(e.target.value)}
        className="flex-1 bg-transparent border-none resize-none text-sm text-zinc-300 focus:ring-0 p-0"
        placeholder="Type something..."
      />
    </div>
  );
}

function BatteryWidget() {
  const [level, setLevel] = useState(100);
  useEffect(() => {
    // @ts-ignore
    if (navigator.getBattery) {
      // @ts-ignore
      navigator.getBattery().then(battery => {
        setLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => setLevel(Math.round(battery.level * 100)));
      });
    }
  }, []);
  return (
    <div className="h-full flex items-center justify-between">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Battery</div>
      <div className="text-xl font-light">{level}%</div>
    </div>
  );
}

function QuoteWidget() {
  return (
    <div className="h-full flex items-center italic text-sm text-zinc-400 text-center">
      "The best way to predict the future is to invent it."
    </div>
  );
}

function MediaWidget() {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4">
      <div className="text-center">
        <div className="text-sm font-medium">Chill Lofi Beats</div>
        <div className="text-xs text-zinc-500">Lofi Girl</div>
      </div>
      <div className="flex gap-6 text-zinc-400">
        <button className="hover:text-white transition-colors">SkipBack</button>
        <button className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform">Play</button>
        <button className="hover:text-white transition-colors">SkipForward</button>
      </div>
    </div>
  );
}

function PhotoWidget() {
  const [img, setImg] = useState(() => localStorage.getItem('widget-photo') || 'https://picsum.photos/seed/vibrant/800/600');
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImg(base64);
        localStorage.setItem('widget-photo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full relative group/photo">
      <img src={img} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-2xl">
        <span className="text-xs uppercase tracking-widest font-bold">Change Photo</span>
        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
      </label>
    </div>
  );
}

function StatsWidget() {
  return (
    <div className="h-full flex flex-col justify-center gap-2">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">CPU</span>
        <span>12%</span>
      </div>
      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
        <div className="bg-blue-500 h-full w-[12%]" />
      </div>
      <div className="flex justify-between text-xs mt-2">
        <span className="text-zinc-500">RAM</span>
        <span>4.2GB / 16GB</span>
      </div>
      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
        <div className="bg-purple-500 h-full w-[26%]" />
      </div>
    </div>
  );
}

function GithubWidget() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">GitHub Stats</div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Commits</span>
          <span>124</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">PRs</span>
          <span>12</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Stars</span>
          <span>42</span>
        </div>
      </div>
    </div>
  );
}

function CountdownWidget() {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="text-3xl font-light">12:04:55</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Next Project Launch</div>
    </div>
  );
}

function NewsWidget() {
  const news = [
    "New AI model released by Google",
    "SpaceX launches 50 more satellites",
    "Tech stocks hit all-time high"
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Tech News</div>
      <div className="space-y-3">
        {news.map((n, i) => (
          <div key={i} className="text-xs text-zinc-400 border-l-2 border-zinc-800 pl-3 py-1 hover:border-zinc-500 transition-colors cursor-pointer">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function YoutubeWidget() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">YT</div>
        <div>
          <div className="text-sm font-medium">TechRepair Pro</div>
          <div className="text-[10px] text-zinc-500">12.4K Subscribers</div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-zinc-400 px-1">
        <span>Views: 1.2M</span>
        <span>Videos: 142</span>
      </div>
    </div>
  );
}

function LinksWidget() {
  const links = [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com' },
    { name: 'Reddit', url: 'https://reddit.com/r/tech' },
    { name: 'YouTube', url: 'https://youtube.com' }
  ];
  return (
    <div className="h-full grid grid-cols-2 gap-2">
      {links.map(l => (
        <a key={l.name} href={l.url} target="_blank" className="flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-colors">
          {l.name}
        </a>
      ))}
    </div>
  );
}

function DiscordWidget() {
  return (
    <div className="h-full flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500">D</div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full" />
      </div>
      <div>
        <div className="text-sm font-medium">Online</div>
        <div className="text-[10px] text-zinc-500">Discord Status</div>
      </div>
    </div>
  );
}

function TimersWidget() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Timers & Alarms</div>
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-zinc-800/30 p-2 rounded-lg">
          <span className="text-xs">Work Focus</span>
          <span className="text-xs font-mono">25:00</span>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/30 p-2 rounded-lg">
          <span className="text-xs">Morning Alarm</span>
          <span className="text-xs font-mono">07:30</span>
        </div>
      </div>
    </div>
  );
}
