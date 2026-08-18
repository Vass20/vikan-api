using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileViewsAndShortlist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProfileViews",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ViewerProfileId = table.Column<string>(type: "text", nullable: false),
                    ViewedProfileId = table.Column<string>(type: "text", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfileViews_Profiles_ViewedProfileId",
                        column: x => x.ViewedProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileViews_Profiles_ViewerProfileId",
                        column: x => x.ViewerProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShortlistedProfiles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ShortlistedProfileId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShortlistedProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShortlistedProfiles_Profiles_ShortlistedProfileId",
                        column: x => x.ShortlistedProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShortlistedProfiles_Profiles_UserId",
                        column: x => x.UserId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileViews_ViewedProfileId",
                table: "ProfileViews",
                column: "ViewedProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileViews_ViewerProfileId",
                table: "ProfileViews",
                column: "ViewerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistedProfiles_ShortlistedProfileId",
                table: "ShortlistedProfiles",
                column: "ShortlistedProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistedProfiles_UserId",
                table: "ShortlistedProfiles",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfileViews");

            migrationBuilder.DropTable(
                name: "ShortlistedProfiles");
        }
    }
}
