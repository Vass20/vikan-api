using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VikanMatrimony.WebApi.Data;

namespace VikanMatrimony.WebApi.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(string receiverProfileId, string text)
        {
            var senderProfileId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(senderProfileId)) return;

            // Validate membership limits
            var sender = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == senderProfileId);
            if (sender == null) return;

            var membership = sender.MembershipType?.ToLower().Replace(" ", "") ?? "free";
            if (membership == "free" || membership == "freemember")
            {
                await Clients.Caller.SendAsync("ReceiveError", "Chat is disabled for Free members. Please upgrade.");
                return;
            }

            if (membership == "silver" || membership == "silvermember")
            {
                var todayUtc = DateTime.UtcNow.Date;
                var sentTodayCount = await _context.Messages
                    .CountAsync(m => m.SenderId == senderProfileId && m.Timestamp >= todayUtc);

                if (sentTodayCount >= 20)
                {
                    await Clients.Caller.SendAsync("ReceiveError", "Daily limit of 20 messages reached. Please upgrade to Gold.");
                    return;
                }
            }

            await Clients.User(receiverProfileId).SendAsync("ReceiveMessage", senderProfileId, text);
        }

        public async Task SendTyping(string receiverProfileId, bool isTyping)
        {
            var senderProfileId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(senderProfileId)) return;

            await Clients.User(receiverProfileId).SendAsync("ReceiveTyping", senderProfileId, isTyping);
        }
    }
}
