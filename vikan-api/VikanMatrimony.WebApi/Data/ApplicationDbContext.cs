using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<ProfilePhoto> ProfilePhotos { get; set; } = null!;
        public DbSet<PartnerPreferences> PartnerPreferences { get; set; } = null!;
        public DbSet<Interest> Interests { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<SafetyReport> SafetyReports { get; set; } = null!;
        public DbSet<Verification> Verifications { get; set; } = null!;
        public DbSet<Caste> Castes { get; set; } = null!;
        public DbSet<EmailOtp> EmailOtps { get; set; } = null!;
        public DbSet<ProfileView> ProfileViews { get; set; } = null!;
        public DbSet<ShortlistedProfile> ShortlistedProfiles { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
 
            // Rename Identity Tables (Remove AspNet prefix)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("Roles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");

            // Notification relationships
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Profile)
                .WithMany()
                .HasForeignKey(n => n.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Profile (1:1)
            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile - ProfilePhoto (1:N)
            modelBuilder.Entity<ProfilePhoto>()
                .HasOne(p => p.Profile)
                .WithMany(pr => pr.Photos)
                .HasForeignKey(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile - PartnerPreferences (1:1)
            modelBuilder.Entity<PartnerPreferences>()
                .HasOne(p => p.Profile)
                .WithOne(pr => pr.PartnerPreferences)
                .HasForeignKey<PartnerPreferences>(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile - Interest (N:M self-referencing relationship)
            modelBuilder.Entity<Interest>()
                .HasOne(i => i.Sender)
                .WithMany(p => p.SentInterests)
                .HasForeignKey(i => i.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Interest>()
                .HasOne(i => i.Receiver)
                .WithMany(p => p.ReceivedInterests)
                .HasForeignKey(i => i.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Profile - Message (N:M self-referencing relationship)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(p => p.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(p => p.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Profile - SafetyReport (N:M self-referencing relationship)
            modelBuilder.Entity<SafetyReport>()
                .HasOne(r => r.Reporter)
                .WithMany(p => p.SentReports)
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SafetyReport>()
                .HasOne(r => r.Reported)
                .WithMany(p => p.ReceivedReports)
                .HasForeignKey(r => r.ReportedId)
                .OnDelete(DeleteBehavior.Restrict);

            // Profile - Verification (1:N)
            modelBuilder.Entity<Verification>()
                .HasOne(v => v.Profile)
                .WithMany(p => p.Verifications)
                .HasForeignKey(v => v.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile - ProfileView
            modelBuilder.Entity<ProfileView>()
                .HasOne(pv => pv.ViewerProfile)
                .WithMany()
                .HasForeignKey(pv => pv.ViewerProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProfileView>()
                .HasOne(pv => pv.ViewedProfile)
                .WithMany()
                .HasForeignKey(pv => pv.ViewedProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile - ShortlistedProfile
            modelBuilder.Entity<ShortlistedProfile>()
                .HasOne(sp => sp.UserProfile)
                .WithMany()
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ShortlistedProfile>()
                .HasOne(sp => sp.TargetProfile)
                .WithMany()
                .HasForeignKey(sp => sp.ShortlistedProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================================
            // PERFORMANCE INDEXES
            // ==========================================
            modelBuilder.Entity<Profile>()
                .HasIndex(p => new { p.IsApproved, p.Gender });

            modelBuilder.Entity<Profile>()
                .HasIndex(p => p.UserId);

            modelBuilder.Entity<Profile>()
                .HasIndex(p => p.ApprovalStatus);

            modelBuilder.Entity<Profile>()
                .HasIndex(p => new { p.Religion, p.Community });

            modelBuilder.Entity<ProfilePhoto>()
                .HasIndex(pp => pp.ProfileId);

            modelBuilder.Entity<Interest>()
                .HasIndex(i => new { i.SenderId, i.ReceiverId });

            modelBuilder.Entity<Interest>()
                .HasIndex(i => new { i.ReceiverId, i.Status });

            modelBuilder.Entity<ProfileView>()
                .HasIndex(pv => new { pv.ViewedProfileId, pv.ViewedAt });

            modelBuilder.Entity<ShortlistedProfile>()
                .HasIndex(sp => new { sp.UserId, sp.ShortlistedProfileId });

            modelBuilder.Entity<Message>()
                .HasIndex(m => new { m.SenderId, m.ReceiverId, m.Timestamp });

            modelBuilder.Entity<EmailOtp>()
                .HasIndex(o => new { o.Email, o.Otp, o.IsVerified });
        }
    }
}
