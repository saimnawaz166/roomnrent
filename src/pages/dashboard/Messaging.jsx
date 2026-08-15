import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import EmptyState from '../../components/ui/EmptyState';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { supabase } from '../../lib/supabaseClient';
import { getAvatarUrl } from '../../lib/photos';
import { formatRelativeTime } from '../../lib/date';

export default function Messaging() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { conversations, fetchMessages, sendMessage, markConversationRead } = useAppData();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Below lg, phones only have room for one pane at a time: show the list
  // until a conversation is opened (id present in the URL), then swap to
  // the thread with a Back button. Both panes stay visible side by side lg+,
  // where the most recent conversation opens by default with no id in the URL.
  const activeId = id || conversations[0]?.id || null;
  const active = conversations.find((c) => c.id === activeId) || null;
  const showList = !id;

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    fetchMessages(activeId)
      .then((msgs) => {
        if (!cancelled) setMessages(msgs);
      })
      .catch((err) => console.error('Failed to load messages:', err.message))
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, fetchMessages]);

  useEffect(() => {
    if (activeId) markConversationRead(activeId);
  }, [activeId, markConversationRead]);

  // Live-appends messages that arrive in the open conversation from either
  // side — Supabase Realtime pushes the new row over a websocket the moment
  // it's inserted, so a chat feels like a chat instead of a refresh-to-see form.
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`messages-${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [
              ...prev,
              {
                id: payload.new.id,
                conversationId: payload.new.conversation_id,
                senderId: payload.new.sender_id,
                text: payload.new.text,
                createdAt: payload.new.created_at,
              },
            ];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setDraft('');
    setSending(true);
    try {
      const sent = await sendMessage(activeId, text);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    } catch (err) {
      console.error('Failed to send message:', err.message);
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-190px)] min-h-[420px] items-center justify-center rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] sm:h-[640px]">
        <EmptyState
          title="No conversations yet"
          description="Message a landlord from a listing, or a Roomer from Find a Roomer, to start a conversation."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[420px] overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] sm:h-[640px]">
      <div
        className={`w-full overflow-auto border-r border-border dark:border-white/10 lg:flex lg:w-80 lg:min-w-80 lg:flex-col ${
          showList ? 'flex flex-col' : 'hidden'
        }`}
      >
        <div className="font-display px-5 pb-4 pt-6 text-lg font-extrabold">Messages</div>
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/messages/${c.id}`)}
            className={`flex w-full gap-3 border-b border-border dark:border-white/10 px-5 py-3.5 text-left cursor-pointer ${
              c.id === activeId ? 'bg-amber-soft/60' : 'hover:bg-cream'
            }`}
          >
            <ImagePlaceholder shape="circle" src={getAvatarUrl(c.email || c.name)} alt={c.name} className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <div className="truncate text-sm font-bold">{c.name}</div>
                <div className="shrink-0 text-[11.5px] text-ink/45 dark:text-cream/45">{formatRelativeTime(c.lastAt)}</div>
              </div>
              {c.listingTitle && <div className="mt-0.5 truncate text-xs text-ink/50 dark:text-cream/50">{c.listingTitle}</div>}
              <div className="flex items-center justify-between gap-2">
                <div className="mt-1 truncate text-[12.5px] text-ink/65 dark:text-cream/65">{c.preview}</div>
                {c.unread > 0 && (
                  <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber px-1.5 text-[10.5px] font-bold text-ink">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={`min-w-0 flex-1 flex-col lg:flex ${showList ? 'hidden' : 'flex'}`}>
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-border dark:border-white/10 px-4 py-4 sm:px-7 sm:py-5">
              <button
                type="button"
                onClick={() => navigate('/messages')}
                aria-label="Back to conversations"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg text-ink/50 dark:text-cream/50 hover:bg-cream lg:hidden"
              >
                ←
              </button>
              <ImagePlaceholder shape="circle" src={getAvatarUrl(active.email || active.name)} alt={active.name} className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold">{active.name}</div>
                {active.listingTitle && (
                  <div className="truncate text-[12.5px] text-ink/55 dark:text-cream/55">{active.listingTitle}</div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 py-5 sm:px-7 sm:py-7">
              {messagesLoading ? (
                <div className="text-center text-sm text-ink/50 dark:text-cream/50">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-ink/50 dark:text-cream/50">No messages yet — say hello.</div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[60%] ${
                          m.senderId === currentUser.id
                            ? 'bg-amber text-ink'
                            : 'border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
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
                disabled={sending || !draft.trim()}
                className="shrink-0 rounded-2xl bg-amber px-5 py-3.5 text-sm font-bold cursor-pointer hover:bg-amber-dark disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-ink/50 dark:text-cream/50">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
