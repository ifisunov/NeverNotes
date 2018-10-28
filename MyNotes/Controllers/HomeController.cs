using Microsoft.AspNet.Identity;
using MyNotes.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity.Owin;
using System.Data.Entity;

namespace MyNotes.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        ApplicationDbContext db = new ApplicationDbContext();

        [Authorize]
        public async System.Threading.Tasks.Task<ActionResult> Index()
        {
            // получение имени пользователя из таблицы AspNetUsers
            ViewBag.Name = await HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>().GetEmailAsync(User.Identity.GetUserId());

            return View();
        }

        //////////////////////////////////////////////////////
        public string ReSave(string title, string body, int nt)
        {
            var note = db.Notes.Find(nt);
            if (note != null)
            {
                note.Title = title;
                note.Body = body;
            }

            db.Entry(note).State = EntityState.Modified;
            db.SaveChanges();
            return "Ok";
        }


        public string DeleteFolder(int folderNumber)
        {
            string currentUser = User.Identity.GetUserId();
            
            var trash = db.Folders.Where(f => f.UserId == currentUser && f.FolderName == "Trash");
            int trId = 0;
            
            foreach (var item in trash)
            {
                trId = item.Id;
            }

            var notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folderNumber);

            foreach (var nt in notes)
            {
                nt.FolderId = trId;
                db.Entry(nt).State = EntityState.Modified;
            }
                
            //db.SaveChanges();


            Models.Folder fld = db.Folders.Find(folderNumber);
            if (fld == null)
                return "Fail";

            db.Folders.Remove(fld);
            db.SaveChanges();

            return "Ok";

        }

        public string CreateNewFolder(string _new)
        {
            string currentUser = User.Identity.GetUserId();
            var folders = db.Folders.Where(f => f.UserId == currentUser);

            foreach (var f in folders)
            {
                if (f.FolderName == _new)
                {
                    return "Fail";
                }
            }

            Folder newFolder = new Folder();
            newFolder.UserId = User.Identity.GetUserId();
            newFolder.FolderName = _new;
            newFolder.FolderCurrent = false;
            

            db.Entry(newFolder).State = EntityState.Added;
            db.SaveChanges();

            return "Ok";

        }

        public JsonResult GetTrashId()
        {
            string currentUser = User.Identity.GetUserId();
            //var currentFolder = from f in db.Folders
            //                    where f.UserId == currentUser && f.FolderCurrent == true
            //                    select new { f.Id, f.FolderName };


            var trash = from f in db.Folders
                                where f.UserId == currentUser && f.FolderName == "Trash"
                                select new { f.Id, f.FolderName };

            //var currentFolder1 = db.Folders.FirstOrDefault();

            return Json(trash, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCurrentFolder()
        {
            string currentUser = User.Identity.GetUserId();
            //var currentFolder = from f in db.Folders
            //                    where f.UserId == currentUser && f.FolderCurrent == true
            //                    select new { f.Id, f.FolderName };


            var currentFolder = from f in db.Folders
                                where f.UserId == currentUser && f.FolderName != "Trash"
                                select new { f.Id, f.FolderName };

            //var currentFolder1 = db.Folders.FirstOrDefault();

            return Json(currentFolder, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetFoldersList()
        {
            string currentUser = User.Identity.GetUserId();
            IEnumerable<Models.Folder> folders;

            folders = db.Folders.Where(f => f.UserId == currentUser);

            return PartialView("GetFoldersListPartialView", folders);
        }

        public ActionResult GetFoldersDropDownMenu()
        {
            string currentUser = User.Identity.GetUserId();
            IEnumerable<Models.Folder> folders;

            folders = db.Folders.Where(f => f.UserId == currentUser && f.FolderName != "Trash");

            return PartialView("GetFoldersDropDownMenu", folders);
        }

        public ActionResult GetFoldersDropDownMenuNewNote()
        {
            string currentUser = User.Identity.GetUserId();
            IEnumerable<Models.Folder> folders;

            folders = db.Folders.Where(f => f.UserId == currentUser && f.FolderName != "Trash");

            return PartialView("GetFoldersDropDownMenuNewNote", folders);
        }

        public string MoveToFolder(int noteNumber, int toFolder)
        {
            var note = db.Notes.Find(noteNumber);
            if (note != null)
            {
                note.FolderId = toFolder;
                db.Entry(note).State = EntityState.Modified;
                db.SaveChanges();
                return "Ok";
            }

            return "Fail";
        }

        public string SetFolderCurrent(int old, int _new)
        {
            var folder = db.Folders.Find(old);
            if (folder != null)
            {
                folder.FolderCurrent = false;
                db.Entry(folder).State = EntityState.Modified;
                db.SaveChanges();

                folder = db.Folders.Find(_new);
                if (folder != null)
                {
                    folder.FolderCurrent = false; //!@!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    db.Entry(folder).State = EntityState.Modified;
                    db.SaveChanges();
                    return "Ok";
                }
            }

            return "Fail";
        }


        public JsonResult GetNoteBody(int noteNumber)
        {
            var folder = from f in db.Notes
                         where f.Id == noteNumber
                         select f.FolderId;
            int? a = folder.FirstOrDefault();

            var note = from n in db.Notes
                       from f in db.Folders
                       where n.Id == noteNumber && f.Id == a 
                       select new { n.Title, n.Body, n.Favourite, f.FolderName };

            return Json(note, JsonRequestBehavior.AllowGet);
        }

        public string Delete(int noteNumber)
        {
            Models.Note note = db.Notes.Find(noteNumber);
            if (note == null)
                return "Fail";

            db.Notes.Remove(note);
            db.SaveChanges();

            return "Ok";
        }

        public string Save(string title, string body, int favourite, int? folder)
        {
            Models.Note newNote = new Models.Note();
            newNote.UserId = User.Identity.GetUserId();
            newNote.Title = title;
            newNote.Body = body;
            newNote.DateOfCreation = DateTime.Now;
            newNote.DateOfChanging = DateTime.Now;
            newNote.Favourite = favourite;
            newNote.FolderId = folder;

            db.Entry(newNote).State = EntityState.Added;
            db.SaveChanges();

            return "Ok";
        }

        public string SetFavourite(int noteNumber, int favourite)
        {
            Models.Note note = db.Notes.Find(noteNumber);
            if (note == null)
                return "Fail";
            note.Favourite = favourite;

            db.Entry(note).State = EntityState.Modified;
            db.SaveChanges();

            return "Ok";
        }

        public ActionResult GetNotesList(string searchAttribute, int method, int? folder, string str = "")
        {
            string currentUser = User.Identity.GetUserId();
            IEnumerable<Models.Note> notes;

            var trash = db.Folders.Where(f => f.UserId == currentUser && f.FolderName == "Trash");
            int trId = 0;
            foreach (var item in trash)
            {
                trId = item.Id;
            }

            if (searchAttribute == "All")
            {
                if (str != "")
                {
                    switch (method)
                    {
                        case 1:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Title.Contains(str))
                                    .OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                        case 2:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Title.Contains(str))
                                    .OrderBy(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderBy(n => n.DateOfCreation);
                            break;
                        case 3:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Title.Contains(str))
                                    .OrderBy(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderBy(n => n.Title);
                            break;
                        case 4:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Title.Contains(str))
                                    .OrderByDescending(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderByDescending(n => n.Title);
                            break;
                        default:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Title.Contains(str))
                                    .OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                    }
                    return PartialView("GetNotesListPartialView", notes);
                }
                else
                {
                    switch (method)
                    {
                        case 1:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder).OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId != trId).OrderByDescending(n => n.DateOfCreation);
                            break;
                        case 2:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder).OrderBy(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId != trId).OrderBy(n => n.DateOfCreation);
                            break;
                        case 3:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder).OrderBy(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId != trId).OrderBy(n => n.Title);
                            break;
                        case 4:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder).OrderByDescending(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId != trId).OrderByDescending(n => n.Title);
                            break;
                        default:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder).OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId != trId).OrderByDescending(n => n.DateOfCreation);
                            break;
                    }
                    return PartialView("GetNotesListPartialView", notes);
                }
            }
            if (searchAttribute == "Favourite")
            {
                if (str != "")
                {
                    switch (method)
                    {
                        case 1:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1 && n.Title.Contains(str))
                                    .OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                        case 2:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1 && n.Title.Contains(str))
                                    .OrderBy(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderBy(n => n.DateOfCreation);
                            break;
                        case 3:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1 && n.Title.Contains(str))
                                    .OrderBy(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderBy(n => n.Title);
                            break;
                        case 4:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1 && n.Title.Contains(str))
                                   .OrderByDescending(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.Title.Contains(str) && n.FolderId != trId)
                                   .OrderByDescending(n => n.Title);
                            break;
                        default:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1 && n.Title.Contains(str))
                                    .OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.Title.Contains(str) && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                    }
                    return PartialView("GetNotesListPartialView", notes);
                }
                else
                {
                    switch (method)
                    {
                        case 1:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1)
                                    .OrderByDescending(n => n.DateOfCreation); 
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                        case 2:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1)
                                    .OrderBy(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.FolderId != trId)
                                    .OrderBy(n => n.DateOfCreation);
                            break;
                        case 3:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1)
                                    .OrderBy(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.FolderId != trId)
                                    .OrderBy(n => n.Title);
                            break;
                        case 4:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1)
                                    .OrderByDescending(n => n.Title);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.FolderId != trId)
                                    .OrderByDescending(n => n.Title);
                            break;
                        default:
                            if (folder != null)
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.FolderId == folder && n.Favourite == 1)
                                    .OrderByDescending(n => n.DateOfCreation);
                            else
                                notes = db.Notes.Where(n => n.UserId == currentUser && n.Favourite == 1 && n.FolderId != trId)
                                    .OrderByDescending(n => n.DateOfCreation);
                            break;
                    }
                    return PartialView("GetNotesListPartialView", notes);
                }
            }
            return HttpNotFound();
        }


        #region Удаленные методы...
        //public ActionResult About()
        //{
        //    ViewBag.Message = "Your application description page.";

        //    return View();
        //}

        //public ActionResult Contact()
        //{
        //    ViewBag.Message = "Your contact page.";

        //    return View();
        //}
        #endregion
    }
}