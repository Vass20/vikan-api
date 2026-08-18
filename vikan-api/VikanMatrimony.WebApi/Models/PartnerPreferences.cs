using System;
using System.Collections.Generic;

namespace VikanMatrimony.WebApi.Models
{
    public class PartnerPreferences
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProfileId { get; set; } = null!;
        public Profile Profile { get; set; } = null!;

        public int AgeMin { get; set; } = 21;
        public int AgeMax { get; set; } = 35;
        public string HeightMin { get; set; } = "5' 0\"";
        public string HeightMax { get; set; } = "6' 2\"";

        public List<string> Religions { get; set; } = new List<string>();
        public List<string> Communities { get; set; } = new List<string>();
        public List<string> MaritalStatuses { get; set; } = new List<string>();
    }
}
