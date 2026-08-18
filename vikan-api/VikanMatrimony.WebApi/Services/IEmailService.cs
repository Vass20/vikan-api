using System.Threading.Tasks;

namespace VikanMatrimony.WebApi.Services
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otp);
        Task SendApprovalEmailAsync(string toEmail, string userName);
        Task SendRejectionEmailAsync(string toEmail, string userName, string? reason);
        Task SendInterestReceivedEmailAsync(string toEmail, string receiverName, string senderName);
        Task SendInterestAcceptedEmailAsync(string toEmail, string senderName, string receiverName);
    }
}
