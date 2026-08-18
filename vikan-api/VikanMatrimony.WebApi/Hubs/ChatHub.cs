using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace VikanMatrimony.WebApi.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendMessage(string receiverProfileId, string text)
        {
            var senderProfileId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(senderProfileId)) return;

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
