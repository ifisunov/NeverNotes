namespace MyNotes.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MigrateDB2 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Folders",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(),
                        FolderName = c.String(),
                        FolderDefault = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.Notes", "FolderId", c => c.Int());
            CreateIndex("dbo.Notes", "FolderId");
            AddForeignKey("dbo.Notes", "FolderId", "dbo.Folders", "Id");
            DropColumn("dbo.Notes", "Folder");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Notes", "Folder", c => c.String());
            DropForeignKey("dbo.Notes", "FolderId", "dbo.Folders");
            DropIndex("dbo.Notes", new[] { "FolderId" });
            DropColumn("dbo.Notes", "FolderId");
            DropTable("dbo.Folders");
        }
    }
}
