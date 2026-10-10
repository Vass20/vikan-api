using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace VikanMatrimony.WebApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private async Task SendEmailCoreAsync(string toEmail, string subject, string htmlBody, string senderName, string senderEmail, string host, int port, string appPassword)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            // Attempt 1: Try Port 465 (SSL Direct) first, as Linux VPS cloud hosts (Hostinger/AWS/DO) open 465 by default
            using (var client = new SmtpClient())
            {
                client.Timeout = 7000; // 7 seconds timeout per attempt
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                try
                {
                    _logger.LogInformation("Connecting to Gmail SMTP {Host}:465 (SSL)...", host);
                    await client.ConnectAsync(host, 465, SecureSocketOptions.SslOnConnect);
                    await client.AuthenticateAsync(senderEmail, appPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                    _logger.LogInformation("Email successfully sent to {Email} via MailKit Port 465 (SSL).", toEmail);
                    return;
                }
                catch (Exception ex465)
                {
                    _logger.LogWarning(ex465, "MailKit SMTP on Port 465 failed ({Message}). Trying Port 587 (STARTTLS)...", ex465.Message);
                }
            }

            // Attempt 2: Try Port 587 (STARTTLS) as fallback
            using (var client587 = new SmtpClient())
            {
                client587.Timeout = 7000;
                client587.ServerCertificateValidationCallback = (s, c, h, e) => true;

                try
                {
                    _logger.LogInformation("Connecting to Gmail SMTP {Host}:587 (STARTTLS)...", host);
                    await client587.ConnectAsync(host, 587, SecureSocketOptions.StartTls);
                    await client587.AuthenticateAsync(senderEmail, appPassword);
                    await client587.SendAsync(message);
                    await client587.DisconnectAsync(true);
                    _logger.LogInformation("Email successfully sent to {Email} via MailKit Port 587 (STARTTLS).", toEmail);
                    return;
                }
                catch (Exception ex587)
                {
                    _logger.LogError(ex587, "MailKit SMTP on Port 587 also failed: {Message}", ex587.Message);
                    throw new InvalidOperationException($"SMTP sending failed on Port 465 and 587. Error: {ex587.Message}", ex587);
                }
            }
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "vikanmatrimony@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "zzmibpayowuthfru";

            var subject = $"{otp} is your Vikan Matrimony Verification Code";
            
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 32px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; margin-bottom: 24px; }}
        .otp-box {{ background: rgba(197, 168, 128, 0.1); border: 2px dashed #C5A880; border-radius: 12px; padding: 18px; margin: 24px 0; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #FFFFFF; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <h2 style='color: #FFFFFF; margin-top: 0;'>Email Verification</h2>
        <p class='subtitle'>Thank you for starting your journey with Vikan Matrimony. Use the verification code below to verify your email address.</p>
        
        <div class='otp-box'>{otp}</div>
        
        <p style='font-size: 13px; color: #CBD5E1;'>This code is valid for <strong>10 minutes</strong>. If you did not request this, please disregard this email.</p>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword);
                _logger.LogInformation("OTP email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendApprovalEmailAsync(string toEmail, string userName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "vikanmatrimony@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "zzmibpayowuthfru";

            var subject = "🎉 Congratulations! Your Vikan Matrimony Profile Has Been Approved";
            
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #D4A94A 0%, #C5A880 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; margin: 10px 0 24px 0; text-transform: uppercase; letter-spacing: 1px; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>✓ Profile Approved &amp; Verified</div>
        <div class='title'>Welcome, {userName}!</div>
        <p class='subtitle'>
            We are pleased to inform you that your profile has been successfully verified and approved by the Superadmin moderation team.
            <br><br>
            You can now log in to your account, browse curated matches, send interests, and begin your journey to finding your ideal life partner.
        </p>
        
        <a href='http://localhost:3000/login' class='btn'>Log In To Your Account</a>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword);
                _logger.LogInformation("Approval email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send approval email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendRejectionEmailAsync(string toEmail, string userName, string? reason)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "vikanmatrimony@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "zzmibpayowuthfru";

            var subject = "Update Regarding Your Vikan Matrimony Registration";
            var reasonText = !string.IsNullOrWhiteSpace(reason) 
                ? reason.Trim() 
                : "Your profile details or uploaded photos did not meet our verification and community safety standards.";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #F87171; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 20px; }}
        .reason-box {{ background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin: 16px 0 24px 0; text-align: left; }}
        .reason-title {{ font-size: 11px; font-weight: bold; text-transform: uppercase; color: #F87171; letter-spacing: 1px; margin-bottom: 6px; }}
        .reason-content {{ font-size: 13px; color: #E2E8F0; line-height: 1.5; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>Registration Review Notice</div>
        <div class='title'>Hello, {userName}</div>
        <p class='subtitle'>
            Thank you for your interest in joining Vikan Matrimony. After careful review by our Superadmin moderation team, your profile registration has not been approved at this time.
        </p>
        
        <div class='reason-box'>
            <div class='reason-title'>Reason for decision:</div>
            <div class='reason-content'>{reasonText}</div>
        </div>

        <p class='subtitle' style='font-size: 13px;'>
            If you believe this was in error, or if you would like to provide updated documentation and accurate details, please contact our support team at <strong style='color: #C5A880;'>support@vikan.com</strong>.
        </p>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword);
                _logger.LogInformation("Rejection email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send rejection email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendInterestReceivedEmailAsync(string toEmail, string receiverName, string senderName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "vikanmatrimony@gmail.com";
            var senderNameConfig = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "zzmibpayowuthfru";

            var subject = $"💌 New Interest Request from {senderName} on Vikan Matrimony";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(197, 168, 128, 0.15); border: 1px solid #C5A880; color: #C5A880; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #E5DCD0 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>New Match Interest</div>
        <div class='title'>Hello, {receiverName}</div>
        <p class='subtitle'>
            <strong style='color: #C5A880;'>{senderName}</strong> has viewed your profile and expressed interest to connect with you on Vikan Matrimony.
        </p>
        <div>
            <a href='http://localhost:3000/dashboard' class='button'>View & Respond to Request</a>
        </div>
        <p class='subtitle' style='font-size: 12px; margin-top: 16px;'>
            Log in to your dashboard to review their complete horoscope, family background, and accept or decline the request.
        </p>
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderNameConfig, senderEmail, host, port, appPassword);
                _logger.LogInformation("Interest received email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send interest received email to {Email}", toEmail);
            }
        }

        public async Task SendInterestAcceptedEmailAsync(string toEmail, string senderName, string receiverName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "vikanmatrimony@gmail.com";
            var senderNameConfig = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "zzmibpayowuthfru";

            var subject = $"🎉 {receiverName} Accepted Your Interest on Vikan Matrimony!";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #E5DCD0 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>Connection Accepted</div>
        <div class='title'>Congratulations, {senderName}!</div>
        <p class='subtitle'>
            <strong style='color: #34D399;'>{receiverName}</strong> has accepted your interest request! You are now mutually connected and can start chatting directly.
        </p>
        <div>
            <a href='http://localhost:3000/chat' class='button'>Start Chatting Now</a>
        </div>
        <p class='subtitle' style='font-size: 12px; margin-top: 16px;'>
            We wish you the very best in taking the next steps in your matrimonial journey.
        </p>
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderNameConfig, senderEmail, host, port, appPassword);
                _logger.LogInformation("Interest accepted email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send interest accepted email to {Email}", toEmail);
            }
        }
    }
}
