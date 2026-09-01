"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  useGetChatConnectionsQuery,
  useGetMessageHistoryQuery,
  useSendMessageLogMutation,
  useGetMyProfileQuery
} from "@/lib/redux/api";
import * as signalR from "@microsoft/signalr";
import { AppConst } from "@/lib/AppConst";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  ShieldAlert,
  Lock,
  Flag,
  User,
  Heart,
  MessageSquare,
  ArrowLeft,
  Search
} from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: connections, isLoading: isConnectionsLoading } = useGetChatConnectionsQuery(undefined, { skip: !currentUser });
  const mutualPartners = connections || [];

  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
   
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch: refetchMessages } = useGetMessageHistoryQuery(activePartnerId || "", { skip: !activePartnerId });
  const [sendMessageApi] = useSendMessageLogMutation();
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !currentUser });

  const todayMessagesSent = React.useMemo(() => {
    if (!messages || !myProfile) return 0;
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    return messages.filter((m: any) => {
      return m.senderId === myProfile.id && new Date(m.sentAt) >= todayStart;
    }).length;
  }, [messages, myProfile]);

  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  const {
    toggleBlock,
    showToast
  } = useAppStore();
   
  // Check auth and select first available partner on load
  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (!currentUser) {
        router.push("/login");
        return;
      } else if (currentUser.email === "admin@vikan.com") {
        router.push("/admin");
        return;
      }
   
      // Find first mutual match to pre-select
      if (mutualPartners.length > 0 && !activePartnerId) {
        setActivePartnerId(mutualPartners[0].id);
      }
    }
  }, [mutualPartners, mounted]);

  // Setup SignalR real-time messaging client connection
  useEffect(() => {
    if (currentUser) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${AppConst.getApiUrl()}/chathub`, {
          accessTokenFactory: () => localStorage.getItem("vikan_token") || ""
        })
        .withAutomaticReconnect()
        .build();

      connection.start()
        .then(() => {
          console.log("SignalR ChatHub Connected!");
          setHubConnection(connection);
        })
        .catch(err => console.error("SignalR Connection Error: ", err));

      return () => {
        connection.stop();
      };
    }
  }, [currentUser]);

  // Listen for real-time messages
  useEffect(() => {
    if (hubConnection) {
      hubConnection.on("ReceiveMessage", (senderId: string, content: string) => {
        refetchMessages();
      });
    }
    return () => {
      if (hubConnection) {
        hubConnection.off("ReceiveMessage");
      }
    };
  }, [hubConnection, refetchMessages]);

  const currentChatMessages = messages || [];
   
  // Auto scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [activePartnerId, currentChatMessages.length]);
   
  if (!mounted || !currentUser) return null;
   
  // Filter partners based on search input
  const filteredPartners = mutualPartners.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
   
  const activePartner = activePartnerId
    ? mutualPartners.find((p: any) => p.id === activePartnerId)
    : null;
   
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId) return;
 
    const membership = myProfile?.membershipType || "Free";
    if (membership === "Free" || membership === "Free Member" || membership === "Free Package") {
      showToast("Chat messaging is reserved for premium plans. Upgrade to a Silver Membership or higher to start chatting with matches!", "warning");
      router.push("/membership");
      return;
    }
 
    if (membership === "Silver Member" || membership === "Silver" || membership === "Silver Tier") {
      if (todayMessagesSent >= 30) {
        showToast("You have reached the daily chat limit of 30 messages for Silver Members. Upgrade to Gold for unlimited messaging!", "warning");
        router.push("/membership");
        return;
      }
    }
    
    try {
      if (hubConnection) {
        await hubConnection.invoke("SendMessage", activePartnerId, inputText);
      }
      await sendMessageApi({
        partnerId: activePartnerId,
        text: inputText
      }).unwrap();

      setInputText("");
      refetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleBlockUser = () => {
    if (activePartnerId) {
      toggleBlock(activePartnerId);
      setActivePartnerId(null);
      setShowBlockModal(false);
      setShowMoreMenu(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-8 px-4 sm:px-6 lg:px-8 text-foreground h-[calc(100vh-80px)] flex flex-col justify-between">
        <div className="mx-auto max-w-7xl w-full flex-1 flex border border-border/80 rounded-2xl shadow-xl overflow-hidden bg-card min-h-[550px] max-h-[75vh]">
          
          {/* LEFT SIDEBAR: CONNECTIONS */}
          <aside className={`w-full md:w-80 border-r border-brand-gold/15 shrink-0 flex flex-col bg-[#0b1626] ${
            activePartnerId ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-4 border-b border-brand-gold/15 bg-[#0f2d52]/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-brand-gold">
                  Conversations
                </h2>
                {mutualPartners.length > 0 && (
                  <span className="bg-brand-gold/15 text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full font-support border border-brand-gold/20">
                    {mutualPartners.length} matches
                  </span>
                )}
              </div>
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#081322] border border-brand-gold/20 focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/30 rounded-xl text-xs outline-none text-[#F7F3EE] font-support transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-1 space-y-0.5 bg-[#081626]/20">
              {mutualPartners.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full text-muted-foreground font-support">
                  <Heart className="h-8 w-8 text-brand-gold mb-3 animate-pulse" />
                  <span className="text-xs font-semibold">No active connections yet</span>
                  <p className="text-[10px] mt-1">
                    Connect with profiles on search and accept received interests to start chatting.
                  </p>
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full text-muted-foreground font-support">
                  <Search className="h-6 w-6 text-brand-gold/50 mb-2" />
                  <span className="text-xs font-semibold">No matches found</span>
                  <p className="text-[10px] mt-0.5">
                    Try searching for another name.
                  </p>
                </div>
              ) : (
                filteredPartners.map((partner: any) => {
                  const isActive = activePartnerId === partner.id;

                  return (
                    <button
                      key={partner.id}
                      onClick={() => setActivePartnerId(partner.id)}
                      className={`w-full flex items-center gap-3 p-3 transition-all text-left relative cursor-pointer border-l-4 ${
                        isActive
                          ? "bg-brand-gold/10 border-l-brand-gold text-[#F7F3EE]"
                          : "border-l-transparent hover:bg-white/5 text-[#E5DCD0]/70 hover:text-white"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={partner.photos?.[0] || "/avatar-placeholder.png"}
                          alt={partner.name}
                          className="h-11 w-11 rounded-full object-cover border border-border"
                        />
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0b1626] bg-emerald-500`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-1">
                          <h4 className="text-xs font-bold truncate">
                            {partner.name}
                          </h4>
                        </div>

                        <span className="text-[10px] text-muted-foreground italic font-support block mt-0.5">
                          Click to start conversation
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT SIDE: CONVERSATION PANEL */}
          <section className={`flex-1 flex flex-col bg-background ${
            activePartnerId ? "flex" : "hidden md:flex"
          }`}>
            {activePartner ? (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActivePartnerId(null)}
                      className="md:hidden p-1.5 text-muted-foreground hover:text-foreground cursor-pointer -ml-1 flex items-center justify-center rounded-full hover:bg-muted/40 transition-colors"
                      title="Back to matches"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <img
                      src={activePartner.photos?.[0] || "/avatar-placeholder.png"}
                      alt={activePartner.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-foreground block">
                        {activePartner.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          activePartner.onlineStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-muted"
                        }`} />
                        <span className="text-[10px] text-muted-foreground font-support">
                          {activePartner.onlineStatus === "online" ? "Online" : `Active ${activePartner.lastActive}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {/* More Menu Dropdown */}
                    {showMoreMenu && (
                      <div className="absolute right-0 mt-2 w-48 glass-premium rounded-xl shadow-lg border border-brand-gold/30 p-2 z-30">
                        <Link
                          href={`/profile/${activePartner.id}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-muted/40 transition-colors"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          View Profile
                        </Link>
                        <hr className="border-border my-1" />
                        <button
                          onClick={() => setShowBlockModal(true)}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                        >
                          <Lock className="h-4 w-4" />
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Box */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4 bg-muted/5">
                  {currentChatMessages.length > 0 ? (
                    currentChatMessages.map((msg: any) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-tr-none border border-transparent"
                              : "bg-card text-foreground rounded-tl-none border border-border"
                          }`}>
                            <p className="text-xs md:text-sm font-sans leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <span className={`text-[8px] font-support mt-1 block text-right ${
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center font-support">
                      <MessageSquare className="h-10 w-10 text-brand-gold mb-3 opacity-50" />
                      <span className="text-xs font-semibold">Start the Conversation</span>
                      <p className="text-[10px] mt-1 max-w-xs">
                        Break the ice by greeting your match. Ask about their educational interests or family alignment.
                      </p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Panel */}
                <form onSubmit={handleSend} className="px-6 py-4 border-t border-border bg-card flex items-center gap-3">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast("Demo feature: Attachment uploads are mocked.", "info")}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
                      title="Upload photos"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast("Demo feature: Document attachments are mocked.", "info")}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
                      title="Attach file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activePartner.name}...`}
                    className="flex-1 px-4 py-2.5 border border-border bg-muted/10 hover:bg-muted/5 focus:bg-card focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-full outline-none text-xs md:text-sm font-sans"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast("Demo feature: Voice recording is simulated.", "info")}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                      title="Send message"
                    >
                      <Send className="h-5 w-5 text-brand-navy" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground font-support bg-muted/5">
                <MessageSquare className="h-14 w-14 text-brand-gold mb-4 opacity-50" />
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground">
                  Select a Chat
                </h3>
                <p className="text-xs mt-1 max-w-sm">
                  Select a mutual match from the left panel sidebar to open your secure communication stream.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>

      <Dialog isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Confirm Block Partner">
        <div className="space-y-4 text-xs font-support leading-relaxed">
          <p>
            Are you sure you want to block **{activePartner?.name}**?
          </p>
          <p className="text-muted-foreground">
            Once blocked, they will be removed from your conversations list. You will not see their profile in search matches.
          </p>
          <div className="flex gap-2 pt-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBlockModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="flex-1 bg-destructive hover:bg-destructive/95 text-white uppercase text-xs" onClick={handleBlockUser}>
              Block User
            </Button>
          </div>
        </div>
      </Dialog>

      <Footer />
    </>
  );
}
