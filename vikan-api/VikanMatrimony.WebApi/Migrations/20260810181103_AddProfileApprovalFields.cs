using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalStatus",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Profiles");
        }
    }
}
