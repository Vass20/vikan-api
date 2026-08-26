import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConst } from "../AppConst";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${AppConst.getApiUrl()}/api`,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from auth state
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Profile", "Interest", "Message", "AdminMetrics", "Verification", "SafetyReport", "Visitors", "Shortlist", "Notification", "SupportTicket"],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<any, any>({
      query: (user) => ({
        url: "/auth/register",
        method: "POST",
        body: user,
      }),
    }),

    // Profile
    getMyProfile: builder.query<any, void>({
      query: () => "/profile/my",
      providesTags: ["Profile"],
    }),
    updateMyProfile: builder.mutation<any, any>({
      query: (profile) => ({
        url: "/profile/my",
        method: "PUT",
        body: profile,
      }),
      invalidatesTags: ["Profile"],
    }),
    getProfileById: builder.query<any, string>({
      query: (id) => `/profile/${id}`,
    }),
    uploadPhoto: builder.mutation<any, { url: string }>({
      query: (photo) => ({
        url: "/profile/my/photos",
        method: "POST",
        body: photo,
      }),
      invalidatesTags: ["Profile"],
    }),
    boostProfile: builder.mutation<any, void>({
      query: () => ({
        url: "/profile/my/boost",
        method: "POST",
      }),
      invalidatesTags: ["Profile"],
    }),
    searchProfiles: builder.query<any, any>({
      query: (params) => ({
        url: "/profile/search",
        params,
      }),
      providesTags: ["Profile"],
    }),
    getMyVisitors: builder.query<any[], void>({
      query: () => "/profile/my/visitors",
      providesTags: ["Visitors"],
    }),
    recordProfileView: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/profile/${id}/view`,
        method: "POST",
      }),
      invalidatesTags: ["Visitors"],
    }),
    getMyShortlisted: builder.query<any[], void>({
      query: () => "/profile/my/shortlisted",
      providesTags: ["Shortlist"],
    }),
    toggleShortlist: builder.mutation<{ isShortlisted: boolean; message: string }, string>({
      query: (id) => ({
        url: `/profile/${id}/shortlist/toggle`,
        method: "POST",
      }),
      invalidatesTags: ["Shortlist"],
    }),

    // Interests
    sendInterest: builder.mutation<any, string>({
      query: (receiverId) => ({
        url: `/interest/send/${receiverId}`,
        method: "POST",
      }),
      invalidatesTags: ["Interest"],
    }),
    acceptInterest: builder.mutation<any, string>({
      query: (senderId) => ({
        url: `/interest/accept/${senderId}`,
        method: "POST",
      }),
      invalidatesTags: ["Interest", "Message"],
    }),
    declineInterest: builder.mutation<any, string>({
      query: (senderId) => ({
        url: `/interest/decline/${senderId}`,
        method: "POST",
      }),
      invalidatesTags: ["Interest"],
    }),
    getReceivedInterests: builder.query<any, void>({
      query: () => "/interest/received",
      providesTags: ["Interest"],
    }),
    getSentInterests: builder.query<any, void>({
      query: () => "/interest/sent",
      providesTags: ["Interest"],
    }),

    // Chats
    getChatConnections: builder.query<any, void>({
      query: () => "/chat/connections",
      providesTags: ["Message"],
    }),
    getMessageHistory: builder.query<any, string>({
      query: (partnerId) => `/chat/messages/${partnerId}`,
      providesTags: ["Message"],
    }),
    sendMessageLog: builder.mutation<any, { partnerId: string; text: string }>({
      query: ({ partnerId, text }) => ({
        url: `/chat/messages/${partnerId}`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Message"],
    }),
    markMessagesAsRead: builder.mutation<any, string>({
      query: (partnerId) => ({
        url: `/chat/messages/read/${partnerId}`,
        method: "POST",
      }),
      invalidatesTags: ["Message"],
    }),

    // Admin
    getDashboardMetrics: builder.query<any, void>({
      query: () => "/admin/metrics",
      providesTags: ["AdminMetrics"],
    }),
    getPendingVerifications: builder.query<any, void>({
      query: () => "/admin/verifications",
      providesTags: ["Verification"],
    }),
    approveVerification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/verifications/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Verification", "AdminMetrics"],
    }),
    rejectVerification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/verifications/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Verification", "AdminMetrics"],
    }),
    getPendingApprovals: builder.query<any[], void>({
      query: () => "/admin/pending-approvals",
      providesTags: ["AdminMetrics"],
    }),
    approveProfile: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/profiles/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["AdminMetrics"],
    }),
    rejectProfile: builder.mutation<{ message: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/profiles/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["AdminMetrics"],
    }),
    getSafetyReports: builder.query<any, void>({
      query: () => "/admin/reports",
      providesTags: ["SafetyReport"],
    }),
    suspendMember: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/members/${id}/suspend`,
        method: "POST",
      }),
      invalidatesTags: ["SafetyReport", "AdminMetrics"],
    }),
    getSupportTickets: builder.query<any[], void>({
      query: () => "/admin/tickets",
      providesTags: ["SupportTicket"],
    }),
    updateTicketStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/tickets/${id}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: ["SupportTicket"],
    }),
    getMyVerifications: builder.query<any, void>({
      query: () => "/profile/my/verification",
      providesTags: ["Verification"],
    }),
    submitVerification: builder.mutation<any, { documentType: string; documentUrl: string; faceScanUrl: string }>({
      query: (body) => ({
        url: "/profile/my/verification",
        method: "POST",
        body,
      }),
    }),
    getCastes: builder.query<Record<string, string[]>, void>({
      query: () => "/metadata/castes",
    }),
    getMembershipPlans: builder.query<any[], void>({
      query: () => "/membership/plans",
    }),
    upgradeMembership: builder.mutation<any, { membershipType: string }>({
      query: (body) => ({
        url: "/membership/upgrade",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    createPaymentOrder: builder.mutation<{ orderId: string; amount: number; currency: string; keyId: string; isSimulation: boolean }, { planName: string }>({
      query: (body) => ({
        url: "/payment/order",
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.mutation<any, { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }>({
      query: (body) => ({
        url: "/payment/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    deletePhoto: builder.mutation<{ message: string; photos: string[] }, { url: string }>({
      query: (body) => ({
        url: "/profile/my/photos/delete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    setPrimaryPhoto: builder.mutation<{ message: string; photos: string[] }, { url: string }>({
      query: (body) => ({
        url: "/profile/my/photos/set-primary",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    submitSupportTicket: builder.mutation<{ ticketNumber: string; message: string }, { name: string; email: string; subject: string; message: string }>({
      query: (body) => ({
        url: "/support/ticket",
        method: "POST",
        body,
      }),
    }),
    uploadPhotoFile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/profile/my/photos/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),
    sendOtp: builder.mutation<{ message: string; expiresInMinutes: number }, { email: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<{ message: string }, { email: string; otp: string }>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    uploadRegistrationPhoto: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/auth/upload-photo",
        method: "POST",
        body: formData,
      }),
    }),
    forgotPasswordSendOtp: builder.mutation<{ message: string; expiresInMinutes: number }, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password/send-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; otp: string; newPassword: string }>({
      query: (body) => ({
        url: "/auth/forgot-password/reset",
        method: "POST",
        body,
      }),
    }),
    getNotifications: builder.query<any[], void>({
      query: () => "/notification",
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/notification/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordSendOtpMutation,
  useResetPasswordMutation,
  useGetCastesQuery,
  useGetMembershipPlansQuery,
  useUpgradeMembershipMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useDeletePhotoMutation,
  useSetPrimaryPhotoMutation,
  useSubmitSupportTicketMutation,
  useUploadPhotoFileMutation,
  useUploadRegistrationPhotoMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetProfileByIdQuery,
  useUploadPhotoMutation,
  useBoostProfileMutation,
  useSearchProfilesQuery,
  useGetMyVisitorsQuery,
  useRecordProfileViewMutation,
  useGetMyShortlistedQuery,
  useToggleShortlistMutation,
  useSendInterestMutation,
  useAcceptInterestMutation,
  useDeclineInterestMutation,
  useGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useGetChatConnectionsQuery,
  useGetMessageHistoryQuery,
  useSendMessageLogMutation,
  useMarkMessagesAsReadMutation,
  useGetDashboardMetricsQuery,
  useGetPendingApprovalsQuery,
  useApproveProfileMutation,
  useRejectProfileMutation,
  useGetPendingVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetSafetyReportsQuery,
  useSuspendMemberMutation,
  useGetSupportTicketsQuery,
  useUpdateTicketStatusMutation,
  useGetMyVerificationsQuery,
  useSubmitVerificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = api;
