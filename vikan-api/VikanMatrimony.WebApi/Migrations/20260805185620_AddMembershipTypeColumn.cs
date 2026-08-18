using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipTypeColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MembershipType",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MembershipType",
                table: "Profiles");
        }
    }
}
