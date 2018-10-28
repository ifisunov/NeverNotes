namespace MyNotes.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MigrateDB3 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Folders", "FolderCurrent", c => c.Boolean(nullable: false));
            DropColumn("dbo.Folders", "FolderDefault");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Folders", "FolderDefault", c => c.Boolean(nullable: false));
            DropColumn("dbo.Folders", "FolderCurrent");
        }
    }
}
