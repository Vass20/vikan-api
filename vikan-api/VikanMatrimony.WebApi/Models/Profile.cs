using System;
using System.Collections.Generic;

namespace VikanMatrimony.WebApi.Models
{
    public class Profile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Religion { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string MotherTongue { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = "Never Married";
        
        public string Education { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Diet { get; set; } = "Vegetarian";
        public string Smoking { get; set; } = "No";
        public string Drinking { get; set; } = "No";
        public string ParentsNumber { get; set; } = string.Empty;
        public string MembershipType { get; set; } = "Free";

        public string FamilyType { get; set; } = "Nuclear";
        public string FamilyStatus { get; set; } = "Middle Class";
        public string FamilyValues { get; set; } = "Moderate";
        public string FamilyDetails { get; set; } = string.Empty;
        public string AboutMe { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;
        public bool IsApproved { get; set; } = false;
        public string ApprovalStatus { get; set; } = "Pending";
        public bool IsPremium { get; set; } = false;
        public string OnlineStatus { get; set; } = "offline";
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PartnerPreferences? PartnerPreferences { get; set; }
        public ICollection<ProfilePhoto> Photos { get; set; } = new List<ProfilePhoto>();
        public ICollection<Interest> SentInterests { get; set; } = new List<Interest>();
        public ICollection<Interest> ReceivedInterests { get; set; } = new List<Interest>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public ICollection<SafetyReport> SentReports { get; set; } = new List<SafetyReport>();
        public ICollection<SafetyReport> ReceivedReports { get; set; } = new List<SafetyReport>();
        public ICollection<Verification> Verifications { get; set; } = new List<Verification>();
    }
}
