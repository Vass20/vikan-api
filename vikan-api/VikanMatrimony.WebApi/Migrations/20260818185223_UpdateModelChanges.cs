using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShortlistedProfiles_UserId",
                table: "ShortlistedProfiles");

            migrationBuilder.DropIndex(
                name: "IX_ProfileViews_ViewedProfileId",
                table: "ProfileViews");

            migrationBuilder.DropIndex(
                name: "IX_Messages_SenderId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Interests_ReceiverId",
                table: "Interests");

            migrationBuilder.DropIndex(
                name: "IX_Interests_SenderId",
                table: "Interests");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistedProfiles_UserId_ShortlistedProfileId",
                table: "ShortlistedProfiles",
                columns: new[] { "UserId", "ShortlistedProfileId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileViews_ViewedProfileId_ViewedAt",
                table: "ProfileViews",
                columns: new[] { "ViewedProfileId", "ViewedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_ApprovalStatus",
                table: "Profiles",
                column: "ApprovalStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_IsApproved_Gender",
                table: "Profiles",
                columns: new[] { "IsApproved", "Gender" });

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_Religion_Community",
                table: "Profiles",
                columns: new[] { "Religion", "Community" });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId_ReceiverId_Timestamp",
                table: "Messages",
                columns: new[] { "SenderId", "ReceiverId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_Interests_ReceiverId_Status",
                table: "Interests",
                columns: new[] { "ReceiverId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Interests_SenderId_ReceiverId",
                table: "Interests",
                columns: new[] { "SenderId", "ReceiverId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmailOtps_Email_Otp_IsVerified",
                table: "EmailOtps",
                columns: new[] { "Email", "Otp", "IsVerified" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShortlistedProfiles_UserId_ShortlistedProfileId",
                table: "ShortlistedProfiles");

            migrationBuilder.DropIndex(
                name: "IX_ProfileViews_ViewedProfileId_ViewedAt",
                table: "ProfileViews");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_ApprovalStatus",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_IsApproved_Gender",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_Religion_Community",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Messages_SenderId_ReceiverId_Timestamp",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Interests_ReceiverId_Status",
                table: "Interests");

            migrationBuilder.DropIndex(
                name: "IX_Interests_SenderId_ReceiverId",
                table: "Interests");

            migrationBuilder.DropIndex(
                name: "IX_EmailOtps_Email_Otp_IsVerified",
                table: "EmailOtps");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistedProfiles_UserId",
                table: "ShortlistedProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileViews_ViewedProfileId",
                table: "ProfileViews",
                column: "ViewedProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Interests_ReceiverId",
                table: "Interests",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Interests_SenderId",
                table: "Interests",
                column: "SenderId");
        }
    }
}
