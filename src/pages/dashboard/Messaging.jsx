import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import { CONVERSATIONS, THREAD } from '../../data/messaging';
import { getAvatarUrl } from '../../lib/photos';

export default function Messaging() {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeId = Number(id) || CONVERSATIONS[0].id;
  const [draft, setDraft] = useState('');
  const active = CONVERSATIONS.find((c) => c.id === activeId) || CONVERSATIONS[0];
  // Below lg, phones only have room for one pane at a time: show the list
  // until a conversation is opened (id present in the URL), then swap to
  // the thread with a Back button. Both panes stay visible side by side lg+.
  const showList = !id;

  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[420px] overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] sm:h-[640px]">
      <div
        className={`w-full overflow-auto border-r border-border dark:border-white/10 lg:flex lg:w-80 lg:min-w-80 lg:flex-col ${
          showList ? 'flex flex-col' : 'hidden'
        }`}
      >
        <div className="font-display px-5 pb-4 pt-6 text-lg font-extrabold">Messages</div>
        {CONVERSATIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/messages/${c.id}`)}
            className={`flex w-full gap-3 border-b border-border dark:border-white/10 px-5 py-3.5 text-left cursor-pointer ${
              c.id === active.id ? 'bg-amber-soft/60' : 'hover:bg-cream'
            }`}
          >
            <ImagePlaceholder shape="circle" src={getAvatarUrl(c.name)} alt={c.name} className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <div className="truncate text-sm font-bold">{c.name}</div>
                <div className="shrink-0 text-[11.5px] text-ink/45 dark:text-cream/45">{c.time}</div>
              </div>
              <div className="mt-0.5 truncate text-xs text-ink/50 dark:text-cream/50">{c.listing}</div>
              <div className="mt-1 truncate text-[12.5px] text-ink/65 dark:text-cream/65">{c.preview}</div>
            </div>
          </button>
        ))}
      </div>

      <div className={`min-w-0 flex-1 flex-col lg:flex ${showList ? 'hidden' : 'flex'}`}>
        <div className="flex items-center gap-3 border-b border-border dark:border-white/10 px-4 py-4 sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            aria-label="Back to conversations"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg text-ink/50 dark:text-cream/50 hover:bg-cream lg:hidden"
          >
            ←
          </button>
          <ImagePlaceholder shape="circle" src={getAvatarUrl(active.name)} alt={active.name} className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold">{active.name}</div>
            <div className="truncate text-[12.5px] text-ink/55 dark:text-cream/55">{active.listing}</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-3.5">
            {THREAD.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[60%] ${
                    m.from === 'me' ? 'bg-amber text-ink' : 'border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDraft('');
          }}
          className="flex gap-2.5 border-t border-border dark:border-white/10 px-4 py-4 sm:gap-3 sm:px-7 sm:py-5"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            className="min-w-0 flex-1 rounded-2xl border border-border dark:border-white/10 px-4 py-3.5 text-sm outline-none focus:border-ink/40"
          />
          <button
            type="submit"
            className="shrink-0 rounded-2xl bg-amber px-5 py-3.5 text-sm font-bold cursor-pointer hover:bg-amber-dark sm:px-6"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
