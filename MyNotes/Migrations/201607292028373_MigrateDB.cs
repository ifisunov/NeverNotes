namespace MyNotes.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MigrateDB : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Notes", "Favourite", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Notes", "Favourite");
        }
    }
}
