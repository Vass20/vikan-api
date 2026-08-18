import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile, generateMockProfiles, PartnerPreferences } from "./mock-data";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  participantId: string;
  messages: Message[];
  isTyping: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "interest" | "message" | "visitor" | "verification" | "system";
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface VerificationRequest {
  profileId: string;
  selfieUrl: string;
  idCardUrl: string;
  status: "pending" | "approved" | "rejected";
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: any;
}

export interface Report {
  id: string;
  profileId: string;
  reporterId: string;
  reason: string;
  timestamp: string;
}

interface AppState {
  // Database Profiles
  profiles: Profile[];
  
  // Auth & Onboarding State
  currentUser: Profile | null;
  registrationStep: number;
  registrationDraft: Partial<Profile>;
  
  // Interaction Lists
  interestsSent: string[]; // profileIds
  interestsReceived: string[]; // profileIds
  interestsAccepted: string[]; // profileIds (mutual match)
  shortlisted: string[]; // profileIds
  blocked: string[]; // profileIds
  visitors: { profileId: string; timestamp: string }[];
  
  // Chats
  chats: { [chatId: string]: ChatSession };
  
  // Notifications
  notifications: NotificationItem[];
  
  // Verification Queue (Admin)
  verificationRequests: VerificationRequest[];
  reports: Report[];
  
  // Search state
  savedSearches: SavedSearch[];
  recentSearches: string[];
  
  // App system settings
  themeMode: "light" | "dark";
 
  // Toast notifications
  toast: { message: string; type: "success" | "error" | "warning" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  hideToast: () => void;
  
  // Actions
  login: (profile: Profile) => void;
  logout: () => void;
  updateDraft: (data: Partial<Profile>) => void;
  setRegistrationStep: (step: number) => void;
  completeRegistration: () => void;
  
  // Profile Interactions
  sendInterest: (profileId: string) => void;
  acceptInterest: (profileId: string) => void;
  declineInterest: (profileId: string) => void;
  toggleShortlist: (profileId: string) => void;
  toggleBlock: (profileId: string) => void;
  addVisitor: (profileId: string) => void;
  
  // Messaging
  sendMessage: (participantId: string, text: string) => void;
  setTyping: (participantId: string, isTyping: boolean) => void;
  markChatAsRead: (participantId: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<NotificationItem, "id" | "timestamp" | "isRead">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Admin Moderate Action
  approveVerification: (profileId: string) => void;
  rejectVerification: (profileId: string) => void;
  submitVerificationRequest: (selfieUrl: string, idCardUrl: string) => void;
  addReport: (profileId: string, reporterId: string, reason: string) => void;
  dismissReport: (reportId: string) => void;
  
  // Searches
  saveSearch: (name: string, filters: any) => void;
  deleteSavedSearch: (id: string) => void;
  addRecentSearch: (query: string) => void;
  
  // Theme Toggle
  toggleTheme: () => void;
  
  // Admin CMS & metrics helper
  updateProfileByAdmin: (profileId: string, data: Partial<Profile>) => void;
  updateProfile: (data: Partial<Profile>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: generateMockProfiles(),
      currentUser: null,
      registrationStep: 1,
      registrationDraft: {
        gender: "female",
        religion: "Hindu",
        motherTongue: "Hindi",
        maritalStatus: "Never Married",
        diet: "Vegetarian",
        smoking: "No",
        drinking: "No",
        familyType: "Nuclear",
        familyStatus: "Middle Class",
        familyValues: "Moderate",
        partnerPreferences: {
          ageMin: 22,
          ageMax: 30,
          heightMin: "5' 0\"",
          heightMax: "6' 0\"",
          religions: ["Hindu"],
          communities: [],
          education: [],
          occupations: [],
          diet: ["Vegetarian"],
          maritalStatus: ["Never Married"]
        }
      },
      
      interestsSent: [],
      interestsReceived: ["vikan-10002", "vikan-10006", "vikan-10012"], // Prefilled received interests
      interestsAccepted: [],
      shortlisted: [],
      blocked: [],
      visitors: [
        { profileId: "vikan-10002", timestamp: "2 hours ago" },
        { profileId: "vikan-10009", timestamp: "5 hours ago" },
        { profileId: "vikan-10015", timestamp: "Yesterday" }
      ],
      
      chats: {},
      notifications: [
        {
          id: "n-1",
          title: "Interest Received",
          body: "Priyanka Iyer expressed interest in your profile.",
          type: "interest",
          timestamp: "2 hours ago",
          isRead: false,
          link: "/dashboard"
        },
        {
          id: "n-2",
          title: "New Match Found",
          body: "Aditya Mehta matches 95% of your partner preferences.",
          type: "system",
          timestamp: "1 day ago",
          isRead: true,
          link: "/profile/vikan-10028"
        }
      ],
      
      verificationRequests: [
        {
          profileId: "vikan-10005",
          selfieUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=300&auto=format&fit=crop",
          idCardUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=300&auto=format&fit=crop",
          status: "pending"
        },
        {
          profileId: "vikan-10011",
          selfieUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop",
          idCardUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=300&auto=format&fit=crop",
          status: "pending"
        }
      ],
      
      reports: [
        {
          id: "rep-1",
          profileId: "vikan-10006",
          reporterId: "vikan-10001",
          reason: "Photos look like stock photos or fake identity.",
          timestamp: "3 hours ago"
        },
        {
          id: "rep-2",
          profileId: "vikan-10012",
          reporterId: "vikan-10002",
          reason: "Inaccurate salary information claimed in profile description.",
          timestamp: "Yesterday"
        }
      ],
      
      savedSearches: [],
      recentSearches: ["Brahmin Software Engineer", "Mumbai MBA"],
      themeMode: "dark",
      toast: null,
 
      showToast: (message, type = "info") => set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
      
      login: (profile) => set({ currentUser: profile }),
      
      logout: () => set({ currentUser: null, registrationStep: 1 }),
      
      updateDraft: (data) => set((state) => ({
        registrationDraft: { ...state.registrationDraft, ...data }
      })),
      
      setRegistrationStep: (step) => set({ registrationStep: step }),
      
      completeRegistration: () => set((state) => {
        const draft = state.registrationDraft;
        const newProfileId = `vikan-${Math.floor(10000 + Math.random() * 90000)}`;
        
        const newProfile: Profile = {
          id: newProfileId,
          name: draft.name || "User Profile",
          gender: draft.gender || "female",
          dob: draft.dob || "1998-01-01",
          age: draft.age || 28,
          height: draft.height || "5' 4\"",
          religion: draft.religion || "Hindu",
          community: draft.community || "Brahmin",
          subCommunity: draft.subCommunity || "Gotra-101",
          motherTongue: draft.motherTongue || "Hindi",
          education: draft.education || "Bachelor of Technology",
          occupation: draft.occupation || "Software Engineer",
          salary: draft.salary || "18 LPA",
          incomeNumeric: draft.incomeNumeric || 1800000,
          country: draft.country || "India",
          state: draft.state || "Maharashtra",
          city: draft.city || "Mumbai",
          maritalStatus: draft.maritalStatus || "Never Married",
          children: draft.children || "No",
          diet: draft.diet || "Vegetarian",
          smoking: draft.smoking as any || "No",
          drinking: draft.drinking as any || "No",
          familyType: draft.familyType as any || "Nuclear",
          familyStatus: draft.familyStatus as any || "Upper Middle Class",
          familyValues: draft.familyValues as any || "Moderate",
          horoscopeRequired: draft.horoscopeRequired || false,
          aboutMe: draft.aboutMe || "I am looking for a life partner who is friendly, educated, and shares family-centric values.",
          familyDetails: draft.familyDetails || "Belonging to a respected family setup with modern and traditional outlooks.",
          photos: draft.photos && draft.photos.length > 0 ? draft.photos : [
            draft.gender === "female" 
              ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop"
          ],
          isVerified: false,
          isPremium: false,
          onlineStatus: "online",
          lastActive: "Active Now",
          partnerPreferences: draft.partnerPreferences as PartnerPreferences || {
            ageMin: 22,
            ageMax: 32,
            heightMin: "5' 0\"",
            heightMax: "6' 2\"",
            religions: [draft.religion || "Hindu"],
            communities: [draft.community || "Brahmin"],
            education: [],
            occupations: [],
            diet: [draft.diet || "Vegetarian"],
            maritalStatus: ["Never Married"]
          }
        };

        // Add to our profiles list
        return {
          currentUser: newProfile,
          profiles: [newProfile, ...state.profiles],
          registrationStep: 1,
          registrationDraft: {} // Clear draft
        };
      }),
      
      sendInterest: (profileId) => set((state) => {
        if (state.interestsSent.includes(profileId)) return {};
        
        const newSent = [...state.interestsSent, profileId];
        const notifications = [...state.notifications];
        let mutual = [...state.interestsAccepted];
        
        // Check if profile was in received, making it mutual
        if (state.interestsReceived.includes(profileId)) {
          mutual.push(profileId);
          // Add mutual notification
          notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Mutual Match!",
            body: `You and ${state.profiles.find(p => p.id === profileId)?.name} have expressed mutual interest. You can now chat!`,
            type: "interest",
            timestamp: "Just Now",
            isRead: false,
            link: "/chat"
          });
        } else {
          notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Interest Expressed",
            body: `You expressed interest in ${state.profiles.find(p => p.id === profileId)?.name}.`,
            type: "interest",
            timestamp: "Just Now",
            isRead: false
          });

          // Simulate automatic reply after 5 seconds
          setTimeout(() => {
            const currentStore = get();
            if (currentStore.currentUser && Math.random() > 0.3) {
              currentStore.acceptInterest(profileId);
            }
          }, 5000);
        }

        return {
          interestsSent: newSent,
          interestsAccepted: mutual,
          notifications
        };
      }),
      
      acceptInterest: (profileId) => set((state) => {
        if (state.interestsAccepted.includes(profileId)) return {};
        
        const name = state.profiles.find(p => p.id === profileId)?.name || "Partner";
        const notifications: NotificationItem[] = [
          {
            id: `n-${Date.now()}`,
            title: "Interest Accepted",
            body: `${name} accepted your interest! Start a conversation.`,
            type: "interest",
            timestamp: "Just Now",
            isRead: false,
            link: "/chat"
          },
          ...state.notifications
        ];
        
        return {
          interestsReceived: state.interestsReceived.filter(id => id !== profileId),
          interestsAccepted: [...state.interestsAccepted, profileId],
          notifications
        };
      }),
      
      declineInterest: (profileId) => set((state) => ({
        interestsReceived: state.interestsReceived.filter(id => id !== profileId)
      })),
      
      toggleShortlist: (profileId) => set((state) => {
        const isShort = state.shortlisted.includes(profileId);
        const name = state.profiles.find(p => p.id === profileId)?.name;
        const notifications = [...state.notifications];
        
        if (!isShort) {
          notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Profile Shortlisted",
            body: `You added ${name} to your shortlist.`,
            type: "system",
            timestamp: "Just Now",
            isRead: false
          });
        }
        
        return {
          shortlisted: isShort 
            ? state.shortlisted.filter(id => id !== profileId)
            : [...state.shortlisted, profileId],
          notifications
        };
      }),
      
      toggleBlock: (profileId) => set((state) => ({
        blocked: state.blocked.includes(profileId)
          ? state.blocked.filter(id => id !== profileId)
          : [...state.blocked, profileId]
      })),
      
      addVisitor: (profileId) => set((state) => {
        // Prevent duplicate immediate records
        const filtered = state.visitors.filter(v => v.profileId !== profileId);
        return {
          visitors: [{ profileId, timestamp: "Just Now" }, ...filtered]
        };
      }),
      
      sendMessage: (participantId, text) => {
        const chatId = [get().currentUser?.id || "user", participantId].sort().join("-");
        const senderId = get().currentUser?.id || "user";
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        
        set((state) => {
          const chat = state.chats[chatId] || {
            id: chatId,
            participantId,
            messages: [],
            isTyping: false
          };
          
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, newMessage]
          };
          
          return {
            chats: { ...state.chats, [chatId]: updatedChat }
          };
        });

        // MOCK REAL-TIME RESPONSE
        // Simulate typing and reply 3 seconds later
        setTimeout(() => {
          set((state) => {
            const chat = state.chats[chatId];
            if (chat) {
              return {
                chats: {
                  ...state.chats,
                  [chatId]: { ...chat, isTyping: true }
                }
              };
            }
            return {};
          });
          
          // Trigger notification
          setTimeout(() => {
            const partnerProfile = get().profiles.find(p => p.id === participantId);
            const partnerName = partnerProfile?.name || "Partner";
            const responses = [
              "Hello! It is lovely to connect with you here. Tell me more about yourself.",
              "Thank you for reaching out. Yes, I think we have a lot in common, especially our education background.",
              "I talked with my parents about our match, and they are also happy to connect. Let's talk further.",
              "Sounds wonderful! What are your thoughts on family alignment and lifestyle preferences?",
              "I am online right now, let me know if you would like to connect on a call sometime this weekend."
            ];
            const replyText = responses[Math.floor(Math.random() * responses.length)];
            const replyMessage: Message = {
              id: `msg-${Date.now() + 1}`,
              senderId: participantId,
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: false
            };

            set((state) => {
              const chat = state.chats[chatId];
              if (!chat) return {};
              
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, replyMessage],
                isTyping: false
              };
              
              const notifications = [
                {
                  id: `n-${Date.now()}`,
                  title: `New message from ${partnerName}`,
                  body: replyText.substring(0, 50) + "...",
                  type: "message" as const,
                  timestamp: "Just Now",
                  isRead: false,
                  link: "/chat"
                },
                ...state.notifications
              ];

              return {
                chats: { ...state.chats, [chatId]: updatedChat },
                notifications
              };
            });
          }, 2000);
        }, 1000);
      },
      
      setTyping: (participantId, isTyping) => set((state) => {
        const chatId = [state.currentUser?.id || "user", participantId].sort().join("-");
        const chat = state.chats[chatId];
        if (!chat) return {};
        return {
          chats: {
            ...state.chats,
            [chatId]: { ...chat, isTyping }
          }
        };
      }),
      
      markChatAsRead: (participantId) => set((state) => {
        const chatId = [state.currentUser?.id || "user", participantId].sort().join("-");
        const chat = state.chats[chatId];
        if (!chat) return {};
        
        const hasUnread = chat.messages.some(
          m => m.senderId !== (state.currentUser?.id || "user") && !m.isRead
        );
        if (!hasUnread) return {};
        
        const updatedMessages = chat.messages.map(m => 
          m.senderId !== (state.currentUser?.id || "user") ? { ...m, isRead: true } : m
        );
        
        return {
          chats: {
            ...state.chats,
            [chatId]: { ...chat, messages: updatedMessages }
          }
        };
      }),
      
      addNotification: (item) => set((state) => ({
        notifications: [
          {
            id: `n-${Date.now()}`,
            ...item,
            timestamp: "Just Now",
            isRead: false
          },
          ...state.notifications
        ]
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
      
      submitVerificationRequest: (selfieUrl, idCardUrl) => set((state) => {
        if (!state.currentUser) return {};
        
        const newRequest: VerificationRequest = {
          profileId: state.currentUser.id,
          selfieUrl,
          idCardUrl,
          status: "pending"
        };
        
        return {
          verificationRequests: [newRequest, ...state.verificationRequests]
        };
      }),
      
      approveVerification: (profileId) => set((state) => {
        // Find profile and update
        const updatedProfiles = state.profiles.map(p => 
          p.id === profileId ? { ...p, isVerified: true } : p
        );
        
        const updatedRequests = state.verificationRequests.map(r => 
          r.profileId === profileId ? { ...r, status: "approved" as const } : r
        );
        
        // Notify user if current user is approved
        let currentUser = state.currentUser;
        let notifications = [...state.notifications];
        if (currentUser && currentUser.id === profileId) {
          currentUser = { ...currentUser, isVerified: true };
          notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Verification Successful",
            body: "Congratulations! Your Vikan verification badge is now active.",
            type: "verification",
            timestamp: "Just Now",
            isRead: false
          });
        }
        
        return {
          profiles: updatedProfiles,
          verificationRequests: updatedRequests,
          currentUser,
          notifications
        };
      }),
      
      rejectVerification: (profileId) => set((state) => {
        const updatedRequests = state.verificationRequests.map(r => 
          r.profileId === profileId ? { ...r, status: "rejected" as const } : r
        );
        
        let notifications = [...state.notifications];
        if (state.currentUser && state.currentUser.id === profileId) {
          notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Verification Rejected",
            body: "Your submitted documents did not match. Please re-upload clear photos.",
            type: "verification",
            timestamp: "Just Now",
            isRead: false,
            link: "/verification"
          });
        }
        
        return {
          verificationRequests: updatedRequests,
          notifications
        };
      }),

      addReport: (profileId, reporterId, reason) => set((state) => {
        const newReport: Report = {
          id: `rep-${Date.now()}`,
          profileId,
          reporterId,
          reason,
          timestamp: "Just Now"
        };
        return {
          reports: [newReport, ...state.reports]
        };
      }),

      dismissReport: (reportId) => set((state) => ({
        reports: state.reports.filter((r) => r.id !== reportId)
      })),
      
      saveSearch: (name, filters) => set((state) => ({
        savedSearches: [...state.savedSearches, { id: `search-${Date.now()}`, name, filters }]
      })),
      
      deleteSavedSearch: (id) => set((state) => ({
        savedSearches: state.savedSearches.filter(s => s.id !== id)
      })),
      
      addRecentSearch: (query) => set((state) => {
        const filtered = state.recentSearches.filter(q => q !== query).slice(0, 4);
        return {
          recentSearches: [query, ...filtered]
        };
      }),
      
      toggleTheme: () => set(() => {
        if (typeof window !== "undefined") {
          window.document.documentElement.classList.add("dark");
        }
        return { themeMode: "dark" };
      }),

      updateProfileByAdmin: (profileId, data) => set((state) => ({
        profiles: state.profiles.map(p => p.id === profileId ? { ...p, ...data } : p),
        currentUser: state.currentUser && state.currentUser.id === profileId 
          ? { ...state.currentUser, ...data }
          : state.currentUser
      })),

      updateProfile: (data) => set((state) => {
        if (!state.currentUser) return {};
        const updatedUser = { ...state.currentUser, ...data };
        return {
          currentUser: updatedUser,
          profiles: state.profiles.map(p => p.id === state.currentUser!.id ? updatedUser : p)
        };
      })
    }),
    {
      name: "vikan-matrimony-state-v4",
      partialize: (state) => ({
        profiles: state.profiles,
        currentUser: state.currentUser,
        interestsSent: state.interestsSent,
        interestsReceived: state.interestsReceived,
        interestsAccepted: state.interestsAccepted,
        shortlisted: state.shortlisted,
        blocked: state.blocked,
        visitors: state.visitors,
        chats: state.chats,
        notifications: state.notifications,
        verificationRequests: state.verificationRequests,
        reports: state.reports,
        savedSearches: state.savedSearches,
        recentSearches: state.recentSearches,
        themeMode: state.themeMode
      })
    }
  )
);
